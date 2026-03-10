import { useState, useEffect } from 'react';
import { Member } from '../../types';

interface Props {
  initial?: Member | null;
  onSave: (data: { name: string; email: string; color: string | null }) => void;
  onCancel: () => void;
  saveError?: string;
}

const COLOR_OPTIONS = [
  '#4f86c6', '#e07b54', '#5caa68', '#9b6bb5',
  '#d4a843', '#5bb8c4', '#c45c7a', '#7a9e4f',
  '#e05c5c', '#7b8fa1', '#c47b2b', '#6b5ea8',
];

export default function MemberForm({ initial, onSave, onCancel, saveError }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [color, setColor] = useState<string | null>(initial?.color ?? null);

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setEmail(initial.email);
      setColor(initial.color ?? null);
    }
  }, [initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSave({ name: name.trim(), email: email.trim(), color });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{initial ? 'Edit Member' : 'Add Member'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              placeholder="Full name"
            />
          </div>
          <div className="form-row">
            <label>Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@example.com"
            />
          </div>
          <div className="form-row">
            <label>Color</label>
            <div className="color-swatches">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-swatch ${color === c ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(color === c ? null : c)}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
          {saveError && <div className="error-banner">{saveError}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
