import { useState } from "react";
import { gifts as giftsApi } from "../lib/api.js";
import StatusSelect from "../components/StatusSelect.jsx";

const ROLES = ["Witness (Vancouver)", "Madrina", "Padrino", "Best man", "Maid of honor", "Bridesmaid", "Groomsman", "Parents", "Other"];
const STATUS_OPTS = [
  { value: "idea", label: "Idea" },
  { value: "ordered", label: "Ordered" },
  { value: "bought", label: "Bought" },
  { value: "wrapped", label: "Wrapped" },
  { value: "given", label: "Given" }
];

export default function GiftsPanel({ gifts, onRefresh }) {
  const [form, setForm] = useState({ recipient: "", role: "Witness (Vancouver)", idea: "", budget: "" });

  async function add(e) {
    e.preventDefault();
    if (!form.recipient.trim()) return;
    await giftsApi.create({ ...form, budget: form.budget ? Number(form.budget) : null });
    setForm({ recipient: "", role: "Witness (Vancouver)", idea: "", budget: "" });
    onRefresh();
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Gifts</h2>
          <p className="desc">Thank-you gifts for witnesses, padrinos/madrinas, wedding party and parents.</p>
        </div>
      </div>
      <form className="add-form" onSubmit={add}>
        <input type="text" placeholder="Recipient name" value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} required />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          {ROLES.map((r) => <option key={r}>{r}</option>)}
        </select>
        <input type="text" placeholder="Gift idea" value={form.idea} onChange={(e) => setForm({ ...form, idea: e.target.value })} />
        <input type="number" placeholder="Budget" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} min="0" />
        <button type="submit">+ Add gift</button>
      </form>
      <div className="table-scroll">
        <table className="data-table">
          <thead><tr>
            <th>Recipient</th><th>Role</th><th>Gift idea</th><th>Budget</th><th>Status</th><th>Notes</th><th></th>
          </tr></thead>
          <tbody>
            {gifts.length === 0 && <tr className="empty-row"><td colSpan={7}>No gifts planned yet — add your first above</td></tr>}
            {gifts.map((g) => <GiftRow key={g.id} gift={g} onRefresh={onRefresh} />)}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function GiftRow({ gift, onRefresh }) {
  async function setStatus(v) { await giftsApi.update(gift.id, { status: v }); onRefresh(); }
  async function setNotes(v) { await giftsApi.update(gift.id, { notes: v }); }
  async function remove() { await giftsApi.remove(gift.id); onRefresh(); }
  return (
    <tr>
      <td>{gift.recipient}</td>
      <td><span className="tag">{gift.role}</span></td>
      <td>{gift.idea || "—"}</td>
      <td>{gift.budget ? `$${gift.budget}` : "—"}</td>
      <td><StatusSelect value={gift.status} options={STATUS_OPTS} onChange={setStatus} /></td>
      <td>
        <input
          className="notes-input"
          defaultValue={gift.notes || ""}
          placeholder="Add note…"
          onBlur={(e) => setNotes(e.target.value)}
        />
      </td>
      <td><button className="del-btn" onClick={remove}>✕</button></td>
    </tr>
  );
}
