import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';

import membersRouter from './routes/members';
import choresRouter from './routes/chores';
import completionsRouter from './routes/completions';
import calendarRouter from './routes/calendar';
import { startScheduler } from './scheduler';

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

app.use(cors());
app.use(express.json());

app.use('/api/members', membersRouter);
app.use('/api/chores', choresRouter);
app.use('/api/completions', completionsRouter);
app.use('/api/calendar', calendarRouter);

// Serve built client in production
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

startScheduler();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
