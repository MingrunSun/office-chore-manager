import { Router, Request, Response } from 'express';
import db from '../db';
import { Chore } from '../types';

const router = Router();

const WITH_MEMBER = `
  SELECT c.*, m.name as member_name
  FROM chores c
  LEFT JOIN members m ON c.member_id = m.id
`;

router.get('/', (_req: Request, res: Response) => {
  const chores = db
    .prepare(`${WITH_MEMBER} ORDER BY c.created_at DESC`)
    .all() as unknown as Chore[];
  res.json(chores);
});

router.post('/', (req: Request, res: Response) => {
  const {
    title, description, member_id, due_time,
    is_recurring, recur_freq, recur_interval, recur_days,
    recur_start, recur_end, due_date,
  } = req.body;

  if (!title) {
    res.status(400).json({ error: 'title is required' });
    return;
  }

  const result = db
    .prepare(
      `INSERT INTO chores
        (title, description, member_id, due_time, is_recurring, recur_freq, recur_interval, recur_days, recur_start, recur_end, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run([
      title.trim(),
      description || null,
      member_id || null,
      due_time || null,
      is_recurring ? 1 : 0,
      recur_freq || null,
      recur_interval || 1,
      recur_days != null ? JSON.stringify(recur_days) : null,
      recur_start || null,
      recur_end || null,
      due_date || null,
    ]);

  const chore = db
    .prepare(`${WITH_MEMBER} WHERE c.id = ?`)
    .get([Number(result.lastInsertRowid)]) as unknown as Chore;
  res.status(201).json(chore);
});

router.put('/:id', (req: Request, res: Response) => {
  const {
    title, description, member_id, due_time,
    is_recurring, recur_freq, recur_interval, recur_days,
    recur_start, recur_end, due_date,
  } = req.body;

  if (!title) {
    res.status(400).json({ error: 'title is required' });
    return;
  }

  const id = parseInt(req.params.id);
  const result = db
    .prepare(
      `UPDATE chores SET
        title = ?, description = ?, member_id = ?, due_time = ?,
        is_recurring = ?, recur_freq = ?, recur_interval = ?, recur_days = ?,
        recur_start = ?, recur_end = ?, due_date = ?
       WHERE id = ?`,
    )
    .run([
      title.trim(),
      description || null,
      member_id || null,
      due_time || null,
      is_recurring ? 1 : 0,
      recur_freq || null,
      recur_interval || 1,
      recur_days != null ? JSON.stringify(recur_days) : null,
      recur_start || null,
      recur_end || null,
      due_date || null,
      id,
    ]);

  if (result.changes === 0) {
    res.status(404).json({ error: 'Chore not found' });
    return;
  }

  const chore = db
    .prepare(`${WITH_MEMBER} WHERE c.id = ?`)
    .get([id]) as unknown as Chore;
  res.json(chore);
});

router.delete('/:id', (req: Request, res: Response) => {
  const result = db
    .prepare('DELETE FROM chores WHERE id = ?')
    .run([parseInt(req.params.id)]);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Chore not found' });
    return;
  }
  res.status(204).send();
});

export default router;
