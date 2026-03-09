import { useState, useEffect } from 'react';
import { Chore, Member } from '../../types';
import { getChores, createChore, updateChore, deleteChore, getMembers } from '../../api';
import ChoreForm from './ChoreForm';

export default function ChoreList() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Chore | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    const [c, m] = await Promise.all([getChores(), getMembers()]);
    setChores(c);
    setMembers(m);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (data: Partial<Chore>) => {
    setError('');
    try {
      if (editing) {
        await updateChore(editing.id, data);
      } else {
        await createChore(data);
      }
      setShowForm(false);
      setEditing(null);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this chore?')) return;
    try {
      await deleteChore(id);
      await load();
    } catch {
      setError('Delete failed');
    }
  };

  const openEdit = (chore: Chore) => {
    setEditing(chore);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setError('');
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Chores</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Chore</button>
      </div>
      {error && <div className="error-banner">{error}</div>}
      {chores.length === 0 ? (
        <p className="empty-state">No chores yet. Click "+ Add Chore" to create one.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Assigned To</th>
              <th>Schedule</th>
              <th>Due Time</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {chores.map((chore) => (
              <tr key={chore.id}>
                <td>
                  <strong>{chore.title}</strong>
                  {chore.description && <div className="sub-text">{chore.description}</div>}
                </td>
                <td>{chore.member_name ?? <span className="dim">—</span>}</td>
                <td>
                  {chore.is_recurring ? (
                    <span className="badge badge-recur">
                      {chore.recur_freq}
                      {chore.recur_interval && chore.recur_interval > 1 ? ` ×${chore.recur_interval}` : ''}
                    </span>
                  ) : (
                    <span>{chore.due_date ?? <span className="dim">—</span>}</span>
                  )}
                </td>
                <td>{chore.due_time ?? <span className="dim">—</span>}</td>
                <td className="row-actions">
                  <button className="btn btn-sm" onClick={() => openEdit(chore)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(chore.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <ChoreForm
          initial={editing}
          members={members}
          onSave={handleSave}
          onCancel={closeForm}
        />
      )}
    </div>
  );
}
