import React, { useState } from 'react';
import { Heart } from 'lucide-react';

export function ProfileOnboarding({ initialName, onSave }) {
  const [name, setName] = useState(initialName || '');
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave(name.trim());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <form className="onboarding-card" onSubmit={submit}>
        <div className="onboarding-card__icon"><Heart size={24} /></div>
        <span className="eyebrow">One quick thing</span>
        <h2>What should we call you?</h2>
        <p>This name replaces your email in the header and is stored privately in your account.</p>
        <label htmlFor="profile-name">Your name</label>
        <input
          id="profile-name"
          autoFocus
          required
          maxLength={80}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Shubham"
        />
        <button className="primary-button" type="submit" disabled={saving || !name.trim()}>
          {saving ? 'Saving…' : 'Continue to my planner'}
        </button>
      </form>
    </div>
  );
}
