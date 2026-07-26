import React, { useState } from 'react';
import { Trash2, UserPlus, Users, ShieldCheck } from 'lucide-react';

export function MembersView({ members, onAddMember, onRemoveMember }) {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await onAddMember({ email, displayName });
      setEmail('');
      setDisplayName('');
    } catch (err) {
      setError(err.message || 'Could not add this member.');
    }
  };

  return (
    <section className="members-view">
      <div className="section-heading">
        <div>
          <span className="eyebrow"><Users size={14} /> Sharing circle</span>
          <h2>People you trust</h2>
          <p>Add up to three people. Adding someone here does not expose any task until you select them on that task.</p>
        </div>
        <span className="member-count">{members.length}/3 added</span>
      </div>

      <form className="member-form" onSubmit={submit}>
        <div>
          <label htmlFor="member-name">Name (optional)</label>
          <input id="member-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Priya" />
        </div>
        <div>
          <label htmlFor="member-email">Google email</label>
          <input id="member-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="person@gmail.com" />
        </div>
        <button className="primary-button" type="submit" disabled={members.length >= 3}>
          <UserPlus size={17} /> Add member
        </button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="member-list">
        {members.length === 0 ? (
          <div className="empty-state">
            <Users size={28} />
            <strong>Your sharing circle is empty</strong>
            <span>Add someone above, then choose exactly which tasks they can see.</span>
          </div>
        ) : members.map((member) => (
          <article className="member-card" key={member.id}>
            <div className="member-avatar">{(member.display_name || member.member_email).charAt(0).toUpperCase()}</div>
            <div>
              <strong>{member.display_name || member.member_email.split('@')[0]}</strong>
              <span>{member.member_email}</span>
            </div>
            <button className="icon-button danger" onClick={() => onRemoveMember(member.id)} aria-label={`Remove ${member.member_email}`}>
              <Trash2 size={17} />
            </button>
          </article>
        ))}
      </div>

      <div className="security-note">
        <ShieldCheck size={18} />
        <p><strong>Private by default.</strong> Members only receive rows explicitly shared with their signed-in email.</p>
      </div>
    </section>
  );
}
