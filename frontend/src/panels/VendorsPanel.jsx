import { useState } from "react";
import { vendors as vendorsApi } from "../lib/api.js";
import StatusSelect from "../components/StatusSelect.jsx";

const CATEGORIES = ["Venue", "Catering", "Photography", "Videography", "Flowers", "Music/DJ", "Officiant", "Transportation", "Attire", "Cake", "Stationery", "Other"];
const STATUS_OPTS = [
  { value: "researching", label: "Researching" },
  { value: "contacted", label: "Contacted" },
  { value: "booked", label: "Booked" },
  { value: "paid", label: "Paid" }
];

export default function VendorsPanel({ vendors, onRefresh }) {
  const [form, setForm] = useState({ category: "Venue", name: "", event: "Colombia", contact: "", price: "" });

  async function add(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await vendorsApi.create({ ...form, price: form.price ? Number(form.price) : null });
    setForm({ category: "Venue", name: "", event: "Colombia", contact: "", price: "" });
    onRefresh();
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Vendors</h2>
          <p className="desc">Every supplier for both weddings — venue, catering, photography, flowers, music, officiants.</p>
        </div>
      </div>
      <form className="add-form" onSubmit={add}>
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input type="text" placeholder="Vendor name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <select value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })}>
          <option>Colombia</option><option>Vancouver</option><option>Both</option>
        </select>
        <input type="text" placeholder="Contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
        <input type="number" placeholder="Quote/price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} min="0" />
        <button type="submit">+ Add vendor</button>
      </form>
      <div className="table-scroll">
        <table className="data-table">
          <thead><tr>
            <th>Category</th><th>Vendor</th><th>Event</th><th>Contact</th><th>Price</th><th>Status</th><th>Notes</th><th></th>
          </tr></thead>
          <tbody>
            {vendors.length === 0 && <tr className="empty-row"><td colSpan={8}>No vendors yet — add your first above</td></tr>}
            {vendors.map((v) => <VendorRow key={v.id} vendor={v} onRefresh={onRefresh} />)}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function VendorRow({ vendor, onRefresh }) {
  async function setStatus(v) { await vendorsApi.update(vendor.id, { status: v }); onRefresh(); }
  async function setNotes(v) { await vendorsApi.update(vendor.id, { notes: v }); }
  async function remove() { await vendorsApi.remove(vendor.id); onRefresh(); }
  return (
    <tr>
      <td><span className="tag">{vendor.category}</span></td>
      <td>{vendor.name}</td>
      <td><span className="tag">{vendor.event}</span></td>
      <td>{vendor.contact || "—"}</td>
      <td>{vendor.price ? `$${vendor.price}` : "—"}</td>
      <td><StatusSelect value={vendor.status} options={STATUS_OPTS} onChange={setStatus} /></td>
      <td>
        <input
          className="notes-input"
          defaultValue={vendor.notes || ""}
          placeholder="Add note…"
          onBlur={(e) => setNotes(e.target.value)}
        />
      </td>
      <td><button className="del-btn" onClick={remove}>✕</button></td>
    </tr>
  );
}
