import React, { useState, useEffect } from 'react';
import { Member } from '../../types';
import { getMembers, createMember, updateMember, deleteMember } from '../../api';
import MemberForm from './MemberForm';

function rowStyle(color: string | null): React.CSSProperties {
  return color ? { backgroundColor: `${color}18` } : {};
}

export default function MemberList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    const data = await getMembers();
    setMembers(data);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (data: { name: string; email: string; color: string | null }) => {
    setError('');
    try {
      if (editing) {
        await updateMember(editing.id, data);
      } else {
        await createMember(data);
      }
      setShowForm(false);
      setEditing(null);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this member? Chore assignments will be cleared.')) return;
    try {
      await deleteMember(id);
      await load();
    } catch {
      setError('Delete failed');
    }
  };

  const openEdit = (member: Member) => {
    setEditing(member);
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
        <h2>Team Members</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Member</button>
      </div>
      {error && <div className="error-banner">{error}</div>}
      {members.length === 0 ? (
        <p className="empty-state">No members yet. Click "+ Add Member" to get started.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Color</th>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} style={rowStyle(m.color)}>
                <td>
                  {m.color ? (
                    <span
                      className="member-color-dot"
                      style={{ backgroundColor: m.color }}
                    />
                  ) : (
                    <span className="dim">—</span>
                  )}
                </td>
                <td><strong>{m.name}</strong></td>
                <td>{m.email}</td>
                <td>{new Date(m.created_at).toLocaleDateString()}</td>
                <td className="row-actions">
                  <button className="btn btn-sm" onClick={() => openEdit(m)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(m.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <MemberForm
          initial={editing}
          onSave={handleSave}
          onCancel={closeForm}
        />
      )}
    </div>
  );
}
