import { useEffect, useRef, useState } from "react";
import { settings as settingsApi } from "../lib/api.js";

// One QR for the printed invitations. Points to /rsvp (no token). The guest
// then enters their name + a shared secret word — configured here — to
// prove they were actually invited.
//
// The current secret is never read back from the server — only whether one
// is set. To change it, admin types a new value. This keeps the secret out
// of every read endpoint entirely.
export default function MasterQrModal({ onClose }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [secret, setSecret] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [renderErr, setRenderErr] = useState(null);
  const [secretSet, setSecretSet] = useState(null); // null = loading
  const url = `${window.location.origin}/rsvp`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await settingsApi.list();
        if (!cancelled) setSecretSet(Boolean(s.rsvp_secret_set));
      } catch {
        if (!cancelled) setSecretSet(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { default: QRCode } = await import("qrcode");
        if (cancelled || !canvasRef.current) return;
        await QRCode.toCanvas(canvasRef.current, url, {
          width: 260,
          margin: 2,
          errorCorrectionLevel: "M",
          color: { dark: "#1B2A3D", light: "#FFFDF9" }
        });
      } catch (e) {
        if (!cancelled) setRenderErr(e.message);
      }
    })();
    return () => { cancelled = true; };
  }, [url]);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "wedding-rsvp-qr.png";
    a.click();
  }

  async function saveSecret(e) {
    e.preventDefault();
    if (!secret.trim()) return;
    setSaving(true);
    try {
      await settingsApi.update({ rsvp_secret: secret.trim() });
      setSaved(true);
      setSecretSet(true);
      setSecret("");
      setTimeout(() => setSaved(false), 1800);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Master RSVP QR</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        {renderErr ? (
          <div className="err">Could not render QR: {renderErr}</div>
        ) : (
          <canvas ref={canvasRef} className="qr-canvas" />
        )}
        <div className="modal-link" title={url}>{url}</div>
        <div className="modal-actions">
          <button className="secondary" onClick={copyLink}>{copied ? "Copied!" : "Copy link"}</button>
          <button className="primary" onClick={download}>Download QR</button>
        </div>

        <hr className="modal-divider" />

        <form onSubmit={saveSecret}>
          <label className="fld">
            Secret word for the invitation
            {secretSet === true && <span className="pill ok">Set</span>}
            {secretSet === false && <span className="pill warn">Not set yet</span>}
          </label>
          <p className="hint">
            Print this word on the invitation next to the QR. Guests type both their name and this word to RSVP.
            Choose something a stranger wouldn't guess — a family nickname, an inside joke, a pet's name.
          </p>
          <input
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder={secretSet ? "Type a new word to replace it" : "e.g. sunflower"}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            maxLength={200}
          />
          <button
            type="submit"
            className="primary"
            disabled={saving || !secret.trim()}
          >
            {saving ? "Saving…" : saved ? "Saved!" : secretSet ? "Replace secret word" : "Set secret word"}
          </button>
          {secretSet === false && (
            <p className="hint" style={{ marginTop: 10, color: "var(--clay)" }}>
              Until you set a secret word, the shared QR will show guests an error.
            </p>
          )}
          <p className="hint" style={{ marginTop: 10 }}>
            The current word is never shown back to you — for privacy. To change it, just type a new one and save.
          </p>
        </form>
      </div>
    </div>
  );
}
