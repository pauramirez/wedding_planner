import { useState } from "react";
import { notes as notesApi } from "../lib/api.js";

export default function NotesPanel({ notes, onRefresh }) {
  const [content, setContent] = useState("");

  async function add(e) {
    e.preventDefault();
    if (!content.trim()) return;
    await notesApi.create({ content: content.trim() });
    setContent("");
    onRefresh();
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Notes</h2>
          <p className="desc">Freeform notes for anything that doesn't fit elsewhere.</p>
        </div>
      </div>
      <form className="add-form" onSubmit={add}>
        <textarea
          className="note-input"
          placeholder="Write a note…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
        />
        <button type="submit">+ Add note</button>
      </form>
      <ul className="notes-list">
        {notes.length === 0 && (
          <li className="note-card empty-row" style={{ textAlign: "center", fontStyle: "italic" }}>
            No notes yet — add the first one above
          </li>
        )}
        {notes.map((n) => <NoteCard key={n.id} note={n} onRefresh={onRefresh} />)}
      </ul>
    </section>
  );
}

function NoteCard({ note, onRefresh }) {
  async function save(v) {
    if (!v.trim() || v.trim() === note.content) return;
    await notesApi.update(note.id, { content: v.trim() });
    onRefresh();
  }
  async function remove() { await notesApi.remove(note.id); onRefresh(); }

  return (
    <li className="note-card">
      <textarea
        className="note-input"
        defaultValue={note.content}
        onBlur={(e) => save(e.target.value)}
        rows={2}
      />
      <div className="note-meta">
        <span>{new Date(note.updated_at || note.created_at).toLocaleString()}</span>
        <button className="del-btn" onClick={remove}>✕</button>
      </div>
    </li>
  );
}
