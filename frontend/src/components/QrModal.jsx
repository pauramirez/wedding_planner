import { useEffect, useRef, useState } from "react";

// Dynamic-import qrcode so the 60-ish KB library only loads when a guest's
// QR is actually opened.
export default function QrModal({ guest, onClose }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [renderErr, setRenderErr] = useState(null);
  const url = `${window.location.origin}/rsvp/${guest.rsvpToken}`;

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
    a.download = `rsvp-${guest.name.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{guest.name}</h3>
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
        <p className="hint">
          Share this with {guest.name}. When they respond, their RSVP updates in the guest list automatically.
        </p>
      </div>
    </div>
  );
}
