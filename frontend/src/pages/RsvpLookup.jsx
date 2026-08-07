import { useState } from "react";
import RsvpPage from "./RsvpPage.jsx";

// Shared-QR flow. The guest lands here with no token in the URL, enters
// their name plus the shared secret word printed on their invitation. On
// success we hold the token in memory and render RsvpPage inline — the token
// never appears in the URL or browser history.
export default function RsvpLookup() {
  const [name, setName] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || ""}/api/rsvp/lookup`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), secret: secret.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not verify your invitation");
      setToken(data.token);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (token) return <RsvpPage token={token} />;

  return (
    <div className="rsvp-wrap">
      <div className="rsvp-card">
        <div className="eyebrow">Wedding RSVP</div>
        <h1>Find your <em>invitation</em></h1>
        <p className="sub">Enter your name exactly as it appears on your invitation, plus the secret word printed on the card.</p>
        <form onSubmit={submit}>
          <label className="fld">Your name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Maria Gonzalez"
            required
            autoComplete="name"
            maxLength={100}
          />
          <label className="fld">Secret word</label>
          <input
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="From your printed invitation"
            required
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            maxLength={200}
          />
          <button className="primary" type="submit" disabled={busy || !name.trim() || !secret.trim()}>
            {busy ? "Checking…" : "Continue"}
          </button>
          {err && <p className="rsvp-err">{err}</p>}
        </form>
      </div>
    </div>
  );
}
