# Office Chore Manager

An internal web app for managing recurring office chores. View, assign, and track chores on a calendar with month and week views.

## Features

- **Calendar views** — month view and Outlook-style week view
- **Recurring chores** — daily, weekly (specific days), and monthly schedules
- **Team members** — assign chores to members, add/remove members
- **Completion tracking** — check off chore instances; state persists across reloads
- **Email reminders** — optional daily SMTP reminders grouped per member
- **30-second polling** — near-real-time updates across multiple users

## Stack

- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite via `node-sqlite3-wasm` (no native build tools required)

## Getting Started

### Prerequisites

- Node.js 18+

### Install & run

```bash
# Terminal 1 — backend (port 3001)
cd server && npm install && npm run dev

# Terminal 2 — frontend (port 5173)
cd client && npm install && npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Environment variables

Copy `.env` and fill in SMTP details to enable email reminders:

```
PORT=3001

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@example.com
SMTP_PASS=yourpassword
SMTP_FROM=you@example.com

REMINDER_HOUR=8   # sends reminders at 8:00 AM server time
```

Email reminders are silently skipped if `SMTP_HOST` is unset.

## Production

Build the client and serve everything from a single Express process:

```bash
cd client && npm run build
cd ../server && npm start
```

Open [http://localhost:3001](http://localhost:3001).

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/members` | List members |
| POST | `/api/members` | Create member |
| PUT | `/api/members/:id` | Update member |
| DELETE | `/api/members/:id` | Delete member |
| GET | `/api/chores` | List chore definitions |
| POST | `/api/chores` | Create chore |
| PUT | `/api/chores/:id` | Update chore |
| DELETE | `/api/chores/:id` | Delete chore |
| GET | `/api/calendar?start=&end=` | Expanded instances with completion state |
| POST | `/api/completions` | Mark instance complete |
| DELETE | `/api/completions/:id` | Unmark completion |
