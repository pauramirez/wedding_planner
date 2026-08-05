import { useRef } from "react";
import { state } from "../lib/api.js";

export default function Toolbar({ data, onRefresh }) {
  const fileRef = useRef(null);

  function exportJson() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wedding-planner-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importJson(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      await state.importJson(parsed);
      onRefresh();
    } catch {
      alert("Couldn't read that file — make sure it's a .json exported from this planner.");
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div className="toolbar">
      <button onClick={exportJson}>↓ Export everything (.json)</button>
      <button onClick={() => fileRef.current?.click()}>↑ Import</button>
      <button onClick={() => window.print()}>🖨 Print / PDF</button>
      <span className="hint">Everything is saved to the shared server as you type.</span>
      <input ref={fileRef} type="file" accept="application/json" onChange={importJson} style={{ display: "none" }} />
    </div>
  );
}
