import { Router, Request, Response } from 'express';
import db from '../db';
import { Completion } from '../types';

const router = Router();

router.post('/', (req: Request, res: Response) => {
  const { choreId, instanceDate, completedBy } = req.body;
  if (!choreId || !instanceDate) {
    res.status(400).json({ error: 'choreId and instanceDate are required' });
    return;
  }
  try {
    const result = db
      .prepare(
        'INSERT OR IGNORE INTO completions (chore_id, instance_date, completed_by) VALUES (?, ?, ?)',
      )
      .run([choreId, instanceDate, completedBy || null]);
    const completion = db
      .prepare('SELECT * FROM completions WHERE chore_id = ? AND instance_date = ?')
      .get([choreId, instanceDate]) as unknown as Completion;
    res.status(result.changes > 0 ? 201 : 200).json(completion);
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  const result = db
    .prepare('DELETE FROM completions WHERE id = ?')
    .run([parseInt(req.params.id)]);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Completion not found' });
    return;
  }
  res.status(204).send();
});

export default router;
