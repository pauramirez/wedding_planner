import { useState } from "react";
import { tasks as tasksApi } from "../lib/api.js";
import StatusSelect from "../components/StatusSelect.jsx";

const STATUS_OPTS = [
  { value: "todo", label: "Todo" },
  { value: "progress", label: "In progress" },
  { value: "done", label: "Done" }
];

export default function TasksPanel({ cat, title, dotClass, tasks, onRefresh }) {
  const [title_, setTitle] = useState("");
  const [owner, setOwner] = useState("Both");
  const [due, setDue] = useState("");
  const [cost, setCost] = useState("");

  const rows = tasks.filter((t) => t.cat === cat);

  async function add(e) {
    e.preventDefault();
    if (!title_.trim()) return;
    await tasksApi.create({ cat, title: title_.trim(), owner, due: due || null, cost: cost ? Number(cost) : null });
    setTitle(""); setDue(""); setCost(""); setOwner("Both");
    onRefresh();
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2><span className={`swatch-dot ${dotClass}`}></span>{title}</h2>
      </div>
      <form className="add-form" onSubmit={add}>
        <input type="text" placeholder="New task…" value={title_} onChange={(e) => setTitle(e.target.value)} required />
        <select value={owner} onChange={(e) => setOwner(e.target.value)}>
          <option>Both</option><option>Paula</option><option>Fiancé</option>
        </select>
        <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        <input type="number" placeholder="Cost" value={cost} onChange={(e) => setCost(e.target.value)} min="0" />
        <button type="submit">+ Add</button>
      </form>
      <table className="data-table">
        <thead><tr>
          <th style={{ width: 30 }}></th><th>Task</th><th>Owner</th><th>Due</th><th>Cost</th><th>Status</th><th>Notes</th><th></th>
        </tr></thead>
        <tbody>
          {rows.length === 0 && <tr className="empty-row"><td colSpan={8}>No tasks yet</td></tr>}
          {rows.map((t) => <TaskRow key={t.id} task={t} onRefresh={onRefresh} />)}
        </tbody>
      </table>
    </section>
  );
}

function TaskRow({ task, onRefresh }) {
  async function toggleDone(e) {
    await tasksApi.update(task.id, { status: e.target.checked ? "done" : "todo" });
    onRefresh();
  }
  async function setStatus(v) { await tasksApi.update(task.id, { status: v }); onRefresh(); }
  async function saveNotes(v) { await tasksApi.update(task.id, { notes: v }); }
  async function remove() { await tasksApi.remove(task.id); onRefresh(); }

  return (
    <tr className={task.status === "done" ? "done" : ""}>
      <td className="no-strike">
        <input type="checkbox" checked={task.status === "done"} onChange={toggleDone} />
      </td>
      <td>{task.title}</td>
      <td><span className="tag">{task.owner}</span></td>
      <td>{task.due || "—"}</td>
      <td>{task.cost ? `$${task.cost}` : "—"}</td>
      <td className="no-strike"><StatusSelect value={task.status} options={STATUS_OPTS} onChange={setStatus} /></td>
      <td className="no-strike">
        <input
          className="notes-input"
          defaultValue={task.notes || ""}
          placeholder="Add note…"
          onBlur={(e) => saveNotes(e.target.value)}
        />
      </td>
      <td className="no-strike"><button className="del-btn" onClick={remove}>✕</button></td>
    </tr>
  );
}
