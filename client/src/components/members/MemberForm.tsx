import { useState, useEffect } from 'react';
import { Member } from '../../types';

interface Props {
  initial?: Member | null;
  onSave: (data: { name: string; email: string }) => void;
  onCancel: () => void;
}

export default function MemberForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setEmail(initial.email);
    }
  }, [initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSave({ name: name.trim(), email: email.trim() });
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
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
