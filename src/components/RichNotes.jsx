import React from 'react';

const renderInline = (text) => {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => (
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
      : <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
  ));
};

export function RichNotes({ value }) {
  const lines = String(value || '').split('\n');
  if (!value?.trim()) {
    return <p className="rich-notes__empty">No notes yet. Add context below before your next focus session.</p>;
  }

  return (
    <div className="rich-notes">
      {lines.map((line, index) => {
        if (line.startsWith('## ')) return <h4 key={index}>{renderInline(line.slice(3))}</h4>;
        if (line.startsWith('# ')) return <h3 key={index}>{renderInline(line.slice(2))}</h3>;
        if (line.startsWith('- [ ] ')) return <p className="rich-notes__check" key={index}>☐ {renderInline(line.slice(6))}</p>;
        if (line.startsWith('- [x] ') || line.startsWith('- [X] ')) {
          return <p className="rich-notes__check rich-notes__check--done" key={index}>☑ {renderInline(line.slice(6))}</p>;
        }
        if (line.startsWith('- ')) return <p className="rich-notes__bullet" key={index}>• {renderInline(line.slice(2))}</p>;
        if (!line.trim()) return <div className="rich-notes__spacer" key={index} />;
        return <p key={index}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

export function NotesEditor({ value, onChange }) {
  const insert = (before, after = '') => {
    const textarea = document.querySelector('[data-notes-editor]');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const nextValue = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    onChange(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    });
  };

  return (
    <div className="notes-editor">
      <div className="notes-editor__toolbar" aria-label="Note formatting">
        <button type="button" onClick={() => insert('**', '**')} title="Bold">B</button>
        <button type="button" onClick={() => insert('## ')} title="Heading">H</button>
        <button type="button" onClick={() => insert('- ')} title="Bullet list">• List</button>
        <button type="button" onClick={() => insert('- [ ] ')} title="Checklist">☐ Check</button>
      </div>
      <textarea
        data-notes-editor
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Add context, decisions, links, or a checklist…"
        maxLength={5000}
        rows={8}
      />
      <span className="notes-editor__count">{value.length}/5000</span>
    </div>
  );
}
