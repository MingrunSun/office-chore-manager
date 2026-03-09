import cron from 'node-cron';
import db from './db';
import { sendReminder } from './mailer';
import { Member, Chore } from './types';
import { format } from 'date-fns';

export function startScheduler(): void {
  if (!process.env.SMTP_HOST) {
    console.log('SMTP_HOST not set — email reminders disabled');
    return;
  }

  const hour = process.env.REMINDER_HOUR || '8';
  const schedule = `0 ${hour} * * *`;

  cron.schedule(schedule, async () => {
    try {
      await sendDailyReminders();
    } catch (err) {
      console.error('Reminder job failed:', err);
    }
  });

  console.log(`Email reminder scheduler started — runs at ${hour}:00 daily`);
}

interface ChoreWithMember extends Chore {
  m_id: number;
  m_name: string;
  m_email: string;
}

async function sendDailyReminders(): Promise<void> {
  const today = format(new Date(), 'yyyy-MM-dd');

  const oneOffChores = db
    .prepare(
      `SELECT c.*, m.id as m_id, m.name as m_name, m.email as m_email
       FROM chores c
       LEFT JOIN members m ON c.member_id = m.id
       WHERE c.is_recurring = 0 AND c.due_date = ?
         AND NOT EXISTS (SELECT 1 FROM completions cp WHERE cp.chore_id = c.id AND cp.instance_date = ?)`,
    )
    .all([today, today]) as unknown as ChoreWithMember[];

  const recurringChores = db
    .prepare(
      `SELECT c.*, m.id as m_id, m.name as m_name, m.email as m_email
       FROM chores c
       LEFT JOIN members m ON c.member_id = m.id
       WHERE c.is_recurring = 1
         AND (c.recur_start IS NULL OR c.recur_start <= ?)
         AND (c.recur_end IS NULL OR c.recur_end >= ?)
         AND NOT EXISTS (SELECT 1 FROM completions cp WHERE cp.chore_id = c.id AND cp.instance_date = ?)`,
    )
    .all([today, today, today]) as unknown as ChoreWithMember[];

  const byMember = new Map<number, { member: Member; chores: Chore[] }>();

  for (const row of [...oneOffChores, ...recurringChores]) {
    if (!row.m_id) continue;
    if (!byMember.has(row.m_id)) {
      byMember.set(row.m_id, {
        member: { id: row.m_id, name: row.m_name, email: row.m_email, created_at: '' },
        chores: [],
      });
    }
    byMember.get(row.m_id)!.chores.push(row);
  }

  for (const { member, chores } of byMember.values()) {
    await sendReminder(member, chores);
    console.log(`Reminder sent to ${member.email} for ${chores.length} chore(s)`);
  }
}
