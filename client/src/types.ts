export interface Member {
  id: number;
  name: string;
  email: string;
  color: string | null;
  created_at: string;
}

export interface Chore {
  id: number;
  title: string;
  description: string | null;
  member_id: number | null;
  member_name: string | null;
  due_time: string | null;
  is_recurring: number;
  recur_freq: 'daily' | 'weekly' | 'monthly' | 'custom' | null;
  recur_interval: number | null;
  recur_days: string | null; // JSON array string
  recur_start: string | null;
  recur_end: string | null;
  due_date: string | null;
  created_at: string;
}

export interface CalendarInstance {
  choreId: number;
  title: string;
  description: string | null;
  memberId: number | null;
  memberName: string | null;
  memberColor: string | null;
  dueTime: string | null;
  instanceDate: string;
  isComplete: boolean;
  completionId: number | null;
}

export type ViewMode = 'month' | 'week';
