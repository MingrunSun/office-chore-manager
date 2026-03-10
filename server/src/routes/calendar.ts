import { Router, Request, Response } from 'express';
import {
  parseISO, addDays, getDay, differenceInCalendarWeeks,
  getDate, addMonths, format, isWithinInterval,
} from 'date-fns';
import db from '../db';
import { Chore, CalendarInstance } from '../types';

const router = Router();

interface ChoreRow extends Chore {
  member_name: string | null;
  member_color: string | null;
}

interface CompletionRow {
  id: number;
  chore_id: number;
  instance_date: string;
}

function expandRecurring(chore: ChoreRow, rangeStart: Date, rangeEnd: Date): string[] {
  const dates: string[] = [];
  const start = chore.recur_start ? parseISO(chore.recur_start) : rangeStart;
  const end = chore.recur_end ? parseISO(chore.recur_end) : rangeEnd;

  const effectiveStart = start < rangeStart ? rangeStart : start;
  const effectiveEnd = end > rangeEnd ? rangeEnd : end;

  if (effectiveStart > effectiveEnd) return dates;

  const interval = chore.recur_interval || 1;
  const freq = chore.recur_freq;

  if (freq === 'daily') {
    let cur = effectiveStart;
    while (cur <= effectiveEnd) {
      dates.push(format(cur, 'yyyy-MM-dd'));
      cur = addDays(cur, interval);
    }
  } else if (freq === 'weekly' || freq === 'custom') {
    const recurDays: number[] = chore.recur_days ? JSON.parse(chore.recur_days) : [];
    const baseWeekStart = chore.recur_start ? parseISO(chore.recur_start) : rangeStart;
    let cur = effectiveStart;
    while (cur <= effectiveEnd) {
      const weekDiff = differenceInCalendarWeeks(cur, baseWeekStart, { weekStartsOn: 1 });
      const dowGetDay = getDay(cur); // 0=Sun..6=Sat
      const dowISO = dowGetDay === 0 ? 7 : dowGetDay; // 1=Mon..7=Sun
      if (weekDiff % interval === 0 && recurDays.includes(dowISO)) {
        dates.push(format(cur, 'yyyy-MM-dd'));
      }
      cur = addDays(cur, 1);
    }
  } else if (freq === 'monthly') {
    const targetDay = chore.recur_start ? getDate(parseISO(chore.recur_start)) : 1;
    let cur = new Date(effectiveStart.getFullYear(), effectiveStart.getMonth(), 1);
    while (cur <= effectiveEnd) {
      const candidate = new Date(cur.getFullYear(), cur.getMonth(), targetDay);
      if (
        candidate >= effectiveStart &&
        candidate <= effectiveEnd &&
        isWithinInterval(candidate, { start: effectiveStart, end: effectiveEnd })
      ) {
        dates.push(format(candidate, 'yyyy-MM-dd'));
      }
      cur = addMonths(cur, interval);
    }
  }

  return dates;
}

router.get('/', (req: Request, res: Response) => {
  const { start, end } = req.query as { start?: string; end?: string };
  if (!start || !end) {
    res.status(400).json({ error: 'start and end query params are required' });
    return;
  }

  const rangeStart = parseISO(start);
  const rangeEnd = parseISO(end);

  const chores = db
    .prepare(
      `SELECT c.*, m.name as member_name, m.color as member_color
       FROM chores c
       LEFT JOIN members m ON c.member_id = m.id`,
    )
    .all() as unknown as ChoreRow[];

  const completions = db
    .prepare(
      `SELECT id, chore_id, instance_date
       FROM completions
       WHERE instance_date BETWEEN ? AND ?`,
    )
    .all([start, end]) as unknown as CompletionRow[];

  const completionMap = new Map<string, { id: number }>();
  for (const c of completions) {
    completionMap.set(`${c.chore_id}:${c.instance_date}`, { id: c.id });
  }

  const instances: CalendarInstance[] = [];

  for (const chore of chores) {
    let dates: string[] = [];

    if (!chore.is_recurring) {
      if (chore.due_date && chore.due_date >= start && chore.due_date <= end) {
        dates = [chore.due_date];
      }
    } else {
      dates = expandRecurring(chore, rangeStart, rangeEnd);
    }

    for (const date of dates) {
      const key = `${chore.id}:${date}`;
      const comp = completionMap.get(key);
      instances.push({
        choreId: chore.id,
        title: chore.title,
        description: chore.description,
        memberId: chore.member_id,
        memberName: chore.member_name,
        memberColor: chore.member_color,
        dueTime: chore.due_time,
        instanceDate: date,
        isComplete: !!comp,
        completionId: comp ? comp.id : null,
      });
    }
  }

  instances.sort((a, b) => {
    const dateCmp = a.instanceDate.localeCompare(b.instanceDate);
    if (dateCmp !== 0) return dateCmp;
    return (a.dueTime || '').localeCompare(b.dueTime || '');
  });

  res.json(instances);
});

export default router;
