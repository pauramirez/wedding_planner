import { useEffect, useState } from "react";
import { palette as paletteApi } from "../lib/api.js";
import { shadesFor, isValidHex } from "../lib/color.js";

export default function PalettePanel({ palette, onRefresh }) {
  const [hex, setHex] = useState("#B5502F");
  const [name, setName] = useState("");
  const [shades, setShades] = useState([]);
  // Local copy of the ordering so drag feels instant. Server confirms after drop.
  const [order, setOrder] = useState(palette);
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);

  useEffect(() => { setOrder(palette); }, [palette]);

  function updateHex(v) { setHex(v.toUpperCase()); }

  async function add() {
    if (!isValidHex(hex)) return alert("Enter a valid hex like #B5502F");
    if (!name.trim()) return alert("Give the color a name");
    await paletteApi.create({ hex, name: name.trim() });
    setName("");
    onRefresh();
  }

  function generate() {
    if (!isValidHex(hex)) return;
    setShades(shadesFor(hex));
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
  }

  async function remove(id) {
    await paletteApi.remove(id);
    onRefresh();
  }

  function onDragStart(e, id) {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(id));
  }

  function onDragOver(e, id) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (overId !== id) setOverId(id);
  }

  function onDragLeave(id) {
    if (overId === id) setOverId(null);
  }

  async function onDrop(e, targetId) {
    e.preventDefault();
    const srcId = dragId ?? Number(e.dataTransfer.getData("text/plain"));
    setDragId(null);
    setOverId(null);
    if (!srcId || srcId === targetId) return;

    const srcIdx = order.findIndex((c) => c.id === srcId);
    const dstIdx = order.findIndex((c) => c.id === targetId);
    if (srcIdx < 0 || dstIdx < 0) return;

    const next = [...order];
    const [moved] = next.splice(srcIdx, 1);
    next.splice(dstIdx, 0, moved);
    setOrder(next);

    try {
      await paletteApi.reorder(next.map((c) => c.id));
      onRefresh();
    } catch {
      // On failure, revert to server truth.
      onRefresh();
    }
  }

  function onDragEnd() {
    setDragId(null);
    setOverId(null);
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Color Palette</h2>
          <p className="desc">Pick a color, preview it, generate shades, and build your wedding palette. Drag any swatch to rearrange.</p>
        </div>
      </div>
      <div className="color-lab">
        <div className="picker-card">
          <h3>Hex color finder</h3>
          <div className="preview-swatch" style={{ background: isValidHex(hex) ? hex : "#ccc" }} />
          <div className="hex-row">
            <input type="color" value={isValidHex(hex) ? hex : "#000000"} onChange={(e) => updateHex(e.target.value)} />
            <input type="text" value={hex} maxLength={7} onChange={(e) => updateHex(e.target.value)} />
          </div>
          <div className="name-row">
            <input type="text" placeholder="Name this color (e.g. Terracotta)" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <button className="primary" onClick={add}>+ Add to palette</button>
          <button className="secondary" onClick={generate}>Generate shades</button>
          {shades.length > 0 && (
            <>
              <div className="shade-label">Click a shade to load it above</div>
              <div className="shade-strip">
                {shades.map((s) => (
                  <div key={s} className="shade-chip" data-hex={s} title={s} style={{ background: s }} onClick={() => updateHex(s)} />
                ))}
              </div>
            </>
          )}
        </div>
        <div className="palette-area">
          <h3>Your palette</h3>
          <p>Click any swatch to load it into the picker. Drag to reorder. Use "copy" to grab the hex code.</p>
          <div className="swatch-grid">
            {order.length === 0 && <div className="empty-palette">No colors saved yet — pick one and add it to your palette</div>}
            {order.map((c) => (
              <div
                key={c.id}
                className={`swatch-chip ${dragId === c.id ? "dragging" : ""} ${overId === c.id && dragId !== c.id ? "drag-over" : ""}`}
                draggable
                onDragStart={(e) => onDragStart(e, c.id)}
                onDragOver={(e) => onDragOver(e, c.id)}
                onDragLeave={() => onDragLeave(c.id)}
                onDrop={(e) => onDrop(e, c.id)}
                onDragEnd={onDragEnd}
              >
                <div className="fill" style={{ background: c.hex }} onClick={() => updateHex(c.hex)} />
                <div className="info">
                  <div className="hexcode">{c.hex}</div>
                  <div className="cname">{c.name}</div>
                  <div className="chip-actions">
                    <button className="copy-btn" onClick={() => copy(c.hex)}>copy</button>
                    <button className="del-btn" onClick={() => remove(c.id)}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
