import { Member, Chore, CalendarInstance } from './types';

const BASE = '/api';

// Members
export async function getMembers(): Promise<Member[]> {
  const res = await fetch(`${BASE}/members`);
  if (!res.ok) throw new Error('Failed to fetch members');
  return res.json();
}

export async function createMember(data: { name: string; email: string; color?: string | null }): Promise<Member> {
  const res = await fetch(`${BASE}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create member');
  }
  return res.json();
}

export async function updateMember(id: number, data: { name: string; email: string; color?: string | null }): Promise<Member> {
  const res = await fetch(`${BASE}/members/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update member');
  }
  return res.json();
}

export async function deleteMember(id: number): Promise<void> {
  const res = await fetch(`${BASE}/members/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete member');
}

// Chores
export async function getChores(): Promise<Chore[]> {
  const res = await fetch(`${BASE}/chores`);
  if (!res.ok) throw new Error('Failed to fetch chores');
  return res.json();
}

export async function createChore(data: Partial<Chore>): Promise<Chore> {
  const res = await fetch(`${BASE}/chores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create chore');
  }
  return res.json();
}

export async function updateChore(id: number, data: Partial<Chore>): Promise<Chore> {
  const res = await fetch(`${BASE}/chores/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update chore');
  }
  return res.json();
}

export async function deleteChore(id: number): Promise<void> {
  const res = await fetch(`${BASE}/chores/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete chore');
}

// Calendar
export async function getCalendar(start: string, end: string): Promise<CalendarInstance[]> {
  const res = await fetch(`${BASE}/calendar?start=${start}&end=${end}`);
  if (!res.ok) throw new Error('Failed to fetch calendar');
  return res.json();
}

// Completions
export async function markComplete(choreId: number, instanceDate: string, completedBy?: number): Promise<{ id: number }> {
  const res = await fetch(`${BASE}/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ choreId, instanceDate, completedBy }),
  });
  if (!res.ok) throw new Error('Failed to mark complete');
  return res.json();
}

export async function unmarkComplete(completionId: number): Promise<void> {
  const res = await fetch(`${BASE}/completions/${completionId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to unmark completion');
}
