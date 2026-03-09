import nodemailer from 'nodemailer';
import { Member, Chore } from './types';

function createTransporter() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

export async function sendReminder(member: Member, chores: Chore[]): Promise<void> {
  const transporter = createTransporter();
  if (!transporter) return;

  const choreList = chores
    .map(c => `  • ${c.title}${c.due_time ? ` at ${c.due_time}` : ''}`)
    .join('\n');

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: member.email,
    subject: `Chore reminder for ${new Date().toLocaleDateString()}`,
    text: `Hi ${member.name},\n\nYou have the following chores due today:\n\n${choreList}\n\nHave a great day!`,
    html: `<p>Hi ${member.name},</p><p>You have the following chores due today:</p><ul>${chores.map(c => `<li><strong>${c.title}</strong>${c.due_time ? ` at ${c.due_time}` : ''}</li>`).join('')}</ul><p>Have a great day!</p>`,
  });
}
