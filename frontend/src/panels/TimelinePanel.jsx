import { useState } from "react";
import { timeline as timelineApi } from "../lib/api.js";

export default function TimelinePanel({ timelineVan, timelineCol, onRefresh }) {
  const [day, setDay] = useState("van");
  const [form, setForm] = useState({ time: "", activity: "", owner: "Both" });

  const list = (day === "van" ? timelineVan : timelineCol)
    .slice()
    .sort((a, b) => (a.time > b.time ? 1 : a.time < b.time ? -1 : 0));

  async function add(e) {
    e.preventDefault();
    if (!form.time || !form.activity.trim()) return;
    await timelineApi.create({ day, time: form.time, activity: form.activity.trim(), owner: form.owner });
    setForm({ time: "", activity: "", owner: "Both" });
    onRefresh();
  }

  async function remove(id) { await timelineApi.remove(id); onRefresh(); }

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Day-of Timeline</h2>
          <p className="desc">Hour-by-hour schedule for each wedding day.</p>
        </div>
      </div>
      <div className="day-tabs">
        <button className={`day-tab-btn ${day === "van" ? "active" : ""}`} onClick={() => setDay("van")}>🇨🇦 Vancouver day</button>
        <button className={`day-tab-btn ${day === "col" ? "active" : ""}`} onClick={() => setDay("col")}>🇨🇴 Colombia day</button>
      </div>
      <form className="add-form" onSubmit={add}>
        <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required style={{ maxWidth: 120 }} />
        <input type="text" placeholder="Activity (e.g. Hair & makeup)" value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })} required />
        <select value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })}>
          <option>Both</option><option>Paula</option><option>Fiancé</option><option>Vendor</option>
        </select>
        <button type="submit">+ Add</button>
      </form>
      <ul className="timeline-list">
        {list.length === 0 && (
          <li className="timeline-item" style={{ justifyContent: "center", color: "var(--muted)", fontStyle: "italic" }}>
            No schedule yet — add the first item above
          </li>
        )}
        {list.map((t) => (
          <li key={t.id} className="timeline-item">
            <span className="tl-time">{t.time}</span>
            <span className="tl-activity">{t.activity}</span>
            <span className="tl-owner tag">{t.owner}</span>
            <button className="del-btn" onClick={() => remove(t.id)}>✕</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
