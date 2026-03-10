import { Router, Request, Response } from 'express';
import db from '../db';
import { Member } from '../types';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const members = db.prepare('SELECT * FROM members ORDER BY name').all() as unknown as Member[];
  res.json(members);
});

router.post('/', (req: Request, res: Response) => {
  const { name, email, color } = req.body;
  if (!name || !email) {
    res.status(400).json({ error: 'name and email are required' });
    return;
  }
  try {
    const result = db
      .prepare('INSERT INTO members (name, email, color) VALUES (?, ?, ?)')
      .run([name.trim(), email.trim().toLowerCase(), color ?? null]);
    const member = db
      .prepare('SELECT * FROM members WHERE id = ?')
      .get([Number(result.lastInsertRowid)]) as unknown as Member;
    res.status(201).json(member);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('UNIQUE')) {
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Database error' });
    }
  }
});

router.put('/:id', (req: Request, res: Response) => {
  const { name, email, color } = req.body;
  const id = parseInt(req.params.id);
  if (!name || !email) {
    res.status(400).json({ error: 'name and email are required' });
    return;
  }
  try {
    const result = db
      .prepare('UPDATE members SET name = ?, email = ?, color = ? WHERE id = ?')
      .run([name.trim(), email.trim().toLowerCase(), color ?? null, id]);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }
    const member = db.prepare('SELECT * FROM members WHERE id = ?').get([id]) as unknown as Member;
    res.json(member);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('UNIQUE')) {
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Database error' });
    }
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  const result = db
    .prepare('DELETE FROM members WHERE id = ?')
    .run([parseInt(req.params.id)]);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Member not found' });
    return;
  }
  res.status(204).send();
});

export default router;
