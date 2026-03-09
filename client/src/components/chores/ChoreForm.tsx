import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Chore, Member } from '../../types';
import RecurrenceEditor from './RecurrenceEditor';

interface RecurData {
  recur_freq: string;
  recur_interval: number;
  recur_days: number[];
  recur_start: string;
  recur_end: string;
}

interface Props {
  initial?: Chore | null;
  members: Member[];
  onSave: (data: Partial<Chore>) => void;
  onCancel: () => void;
}

const today = format(new Date(), 'yyyy-MM-dd');

export default function ChoreForm({ initial, members, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [memberId, setMemberId] = useState<string>(initial?.member_id?.toString() ?? '');
  const [dueTime, setDueTime] = useState(initial?.due_time ?? '');
  const [isRecurring, setIsRecurring] = useState(!!initial?.is_recurring);
  const [dueDate, setDueDate] = useState(initial?.due_date ?? today);
  const [recurData, setRecurData] = useState<RecurData>({
    recur_freq: initial?.recur_freq ?? 'weekly',
    recur_interval: initial?.recur_interval ?? 1,
    recur_days: initial?.recur_days ? JSON.parse(initial.recur_days) : [],
    recur_start: initial?.recur_start ?? today,
    recur_end: initial?.recur_end ?? '',
  });

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setDescription(initial.description ?? '');
      setMemberId(initial.member_id?.toString() ?? '');
      setDueTime(initial.due_time ?? '');
      setIsRecurring(!!initial.is_recurring);
      setDueDate(initial.due_date ?? today);
      setRecurData({
        recur_freq: initial.recur_freq ?? 'weekly',
        recur_interval: initial.recur_interval ?? 1,
        recur_days: initial.recur_days ? JSON.parse(initial.recur_days) : [],
        recur_start: initial.recur_start ?? today,
        recur_end: initial.recur_end ?? '',
      });
    }
  }, [initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const data: Partial<Chore> = {
      title: title.trim(),
      description: description || undefined,
      member_id: memberId ? parseInt(memberId) : null,
      due_time: dueTime || null,
      is_recurring: isRecurring ? 1 : 0,
    };

    if (isRecurring) {
      Object.assign(data, {
        recur_freq: recurData.recur_freq,
        recur_interval: recurData.recur_interval,
        recur_days: recurData.recur_days.length > 0 ? recurData.recur_days : undefined,
        recur_start: recurData.recur_start || null,
        recur_end: recurData.recur_end || null,
        due_date: null,
      });
    } else {
      Object.assign(data, {
        due_date: dueDate || null,
        recur_freq: null,
        recur_interval: null,
        recur_days: null,
        recur_start: null,
        recur_end: null,
      });
    }

    onSave(data);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{initial ? 'Edit Chore' : 'New Chore'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              placeholder="e.g. Clean the kitchen"
            />
          </div>

          <div className="form-row">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Optional notes"
            />
          </div>

          <div className="form-row">
            <label>Assigned to</label>
            <select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
              <option value="">— unassigned —</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Due time</label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
            />
            <span className="hint">(optional)</span>
          </div>

          <div className="form-row">
            <label>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              Recurring
            </label>
          </div>

          {!isRecurring && (
            <div className="form-row">
              <label>Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          )}

          {isRecurring && (
            <RecurrenceEditor value={recurData} onChange={setRecurData} />
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
