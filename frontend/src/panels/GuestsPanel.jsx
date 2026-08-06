import { useState } from "react";
import { guests as guestsApi } from "../lib/api.js";
import StatusSelect from "../components/StatusSelect.jsx";
import QrModal from "../components/QrModal.jsx";

const RSVP_OPTS = [
  { value: "pending", label: "Pending" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" }
];

export default function GuestsPanel({ guests, onRefresh }) {
  const [form, setForm] = useState({ name: "", side: "Bride's side", event: "Colombia", plusOne: "No", table: "", contact: "" });
  const [qrGuest, setQrGuest] = useState(null);

  async function add(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await guestsApi.create(form);
    setForm({ name: "", side: "Bride's side", event: "Colombia", plusOne: "No", table: "", contact: "" });
    onRefresh();
  }

  const total = guests.length;
  const van = guests.filter((g) => g.event === "Vancouver" || g.event === "Both").length;
  const col = guests.filter((g) => g.event === "Colombia" || g.event === "Both").length;
  const yes = guests.filter((g) => g.rsvp === "yes").length;

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Guest List</h2>
          <p className="desc">Track invitees for either wedding — RSVP, meal choice, plus-ones and table assignment.</p>
        </div>
      </div>
      <div className="summary-row">
        <Summary label="Total invited" value={total} />
        <Summary label="🇨🇦 Vancouver" value={van} />
        <Summary label="🇨🇴 Colombia" value={col} />
        <Summary label="Confirmed yes" value={yes} />
      </div>
      <form className="add-form" onSubmit={add}>
        <input type="text" placeholder="Guest name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <select value={form.side} onChange={(e) => setForm({ ...form, side: e.target.value })}>
          <option>Bride's side</option><option>Groom's side</option><option>Both</option>
        </select>
        <select value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })}>
          <option>Colombia</option><option>Vancouver</option><option>Both</option>
        </select>
        <select value={form.plusOne} onChange={(e) => setForm({ ...form, plusOne: e.target.value })}>
          <option value="No">No plus-one</option><option value="Yes">Plus-one</option>
        </select>
        <input type="text" placeholder="Table #" value={form.table} onChange={(e) => setForm({ ...form, table: e.target.value })} style={{ maxWidth: 80 }} />
        <input type="text" placeholder="Contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
        <button type="submit">+ Add guest</button>
      </form>
      <table className="data-table">
        <thead><tr>
          <th>Name</th><th>Side</th><th>Event</th><th>Plus-one</th><th>Table</th><th>RSVP</th><th>Meal</th><th>Contact</th><th></th>
        </tr></thead>
        <tbody>
          {guests.length === 0 && <tr className="empty-row"><td colSpan={9}>No guests yet — add your first above</td></tr>}
          {guests.map((g) => <GuestRow key={g.id} guest={g} onRefresh={onRefresh} onShowQr={() => setQrGuest(g)} />)}
        </tbody>
      </table>
      {qrGuest && <QrModal guest={qrGuest} onClose={() => setQrGuest(null)} />}
    </section>
  );
}

function GuestRow({ guest, onRefresh, onShowQr }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(guest);

  async function save() { await guestsApi.update(guest.id, draft); setEditing(false); onRefresh(); }
  async function remove() { await guestsApi.remove(guest.id); onRefresh(); }
  async function setRsvp(v) { await guestsApi.update(guest.id, { rsvp: v }); onRefresh(); }
  async function setMeal(v) { await guestsApi.update(guest.id, { meal: v }); }

  if (editing) {
    return (
      <tr>
        <td><input className="edit-field" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></td>
        <td>
          <select className="edit-field" value={draft.side} onChange={(e) => setDraft({ ...draft, side: e.target.value })}>
            <option>Bride's side</option><option>Groom's side</option><option>Both</option>
          </select>
        </td>
        <td>
          <select className="edit-field" value={draft.event} onChange={(e) => setDraft({ ...draft, event: e.target.value })}>
            <option>Colombia</option><option>Vancouver</option><option>Both</option>
          </select>
        </td>
        <td>
          <select className="edit-field" value={draft.plusOne} onChange={(e) => setDraft({ ...draft, plusOne: e.target.value })}>
            <option>No</option><option>Yes</option>
          </select>
        </td>
        <td><input className="edit-field" value={draft.table || ""} onChange={(e) => setDraft({ ...draft, table: e.target.value })} /></td>
        <td colSpan={3}><input className="edit-field" value={draft.contact || ""} onChange={(e) => setDraft({ ...draft, contact: e.target.value })} /></td>
        <td className="row-actions">
          <button className="save-btn" onClick={save}>Save</button>
          <button className="cancel-btn" onClick={() => { setEditing(false); setDraft(guest); }}>Cancel</button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{guest.name}</td>
      <td><span className="tag">{guest.side}</span></td>
      <td><span className="tag">{guest.event}</span></td>
      <td>{guest.plusOne === "Yes" ? "+1" : "—"}</td>
      <td>{guest.table || "—"}</td>
      <td><StatusSelect value={guest.rsvp} options={RSVP_OPTS} onChange={setRsvp} /></td>
      <td>
        <input
          className="notes-input"
          defaultValue={guest.meal || ""}
          placeholder="Meal…"
          onBlur={(e) => setMeal(e.target.value)}
        />
      </td>
      <td>{guest.contact || "—"}</td>
      <td className="row-actions">
        <button className="qr-btn" onClick={onShowQr} title="Show RSVP QR code" disabled={!guest.rsvpToken}>QR</button>
        <button className="edit-btn" onClick={() => setEditing(true)}>✎ Edit</button>
        <button className="del-btn" onClick={remove}>✕</button>
      </td>
    </tr>
  );
}

function Summary({ label, value }) {
  return (
    <div className="summary-box">
      <div className="label">{label}</div>
      <div className="amt">{value}</div>
    </div>
  );
}
