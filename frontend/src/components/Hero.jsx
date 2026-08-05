import { useEffect, useState } from "react";
import { settings } from "../lib/api.js";

function daysUntil(date) {
  if (!date) return null;
  const target = new Date(date + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / 86400000);
}

function taskProgress(tasks, cat) {
  const list = tasks.filter((t) => t.cat === cat);
  const done = list.filter((t) => t.status === "done").length;
  return { done, total: list.length, pct: list.length ? Math.round((done / list.length) * 100) : 0 };
}

export default function Hero({ data, onRefresh }) {
  const [van, setVan] = useState(data.weddingDates.van || "");
  const [col, setCol] = useState(data.weddingDates.col || "");

  useEffect(() => { setVan(data.weddingDates.van || ""); setCol(data.weddingDates.col || ""); }, [data.weddingDates]);

  async function saveDates(next) {
    await settings.update(next);
    onRefresh();
  }

  const vanDays = daysUntil(van);
  const colDays = daysUntil(col);
  const van_ = taskProgress(data.tasks, "vancouver");
  const col_ = taskProgress(data.tasks, "colombia");
  const shared_ = taskProgress(data.tasks, "shared");
  const totalDone = van_.done + col_.done + shared_.done;
  const totalAll = van_.total + col_.total + shared_.total;
  const totalPct = totalAll ? Math.round((totalDone / totalAll) * 100) : 0;

  return (
    <header className="hero">
      <div className="hero-inner">
        <div className="eyebrow">Vancouver &amp; Colombia · Full Planner</div>
        <h1>Our <em>Wedding</em><br />Planner</h1>
        <p className="sub">One marriage, two ceremonies. Every task, guest, vendor, gift, and color swatch for both weddings — in one place.</p>

        <div className="dates-row">
          <div className="date-field">
            <label>Vancouver civil date</label>
            <input type="date" value={van} onChange={(e) => { setVan(e.target.value); saveDates({ wedding_date_van: e.target.value }); }} />
          </div>
          <div className="date-field">
            <label>Colombia catholic date</label>
            <input type="date" value={col} onChange={(e) => { setCol(e.target.value); saveDates({ wedding_date_col: e.target.value }); }} />
          </div>
          <div className="countdown">
            {vanDays !== null && vanDays >= 0 && (
              <div className="cd-box"><div className="n">{vanDays}</div><div className="l">Days to 🇨🇦</div></div>
            )}
            {colDays !== null && colDays >= 0 && (
              <div className="cd-box"><div className="n">{colDays}</div><div className="l">Days to 🇨🇴</div></div>
            )}
          </div>
        </div>

        <div className="progress-row">
          <ProgressCard label="Vancouver" p={van_} cls="van" />
          <ProgressCard label="Colombia" p={col_} cls="col" />
          <ProgressCard label="Shared" p={shared_} cls="shared" />
          <ProgressCard label="Overall" p={{ done: totalDone, total: totalAll, pct: totalPct }} cls="all" />
        </div>
      </div>
    </header>
  );
}

function ProgressCard({ label, p, cls }) {
  return (
    <div className="progress-card">
      <div className="label">{label}</div>
      <div className="count">{p.done} / {p.total}</div>
      <div className="bar-track"><div className={`bar-fill ${cls}`} style={{ width: `${p.pct}%` }} /></div>
    </div>
  );
}
