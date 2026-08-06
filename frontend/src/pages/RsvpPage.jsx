import { useEffect, useState } from "react";

export default function RsvpPage({ token }) {
  const [guest, setGuest] = useState(null);
  const [err, setErr] = useState(null);
  const [rsvp, setRsvp] = useState("");
  const [meal, setMeal] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE || ""}/api/rsvp/${token}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data?.error || "This RSVP link is not valid.");
        setGuest(data.guest);
        setRsvp(data.guest.rsvp && data.guest.rsvp !== "pending" ? data.guest.rsvp : "");
        setMeal(data.guest.meal || "");
      } catch (e) {
        if (!cancelled) setErr(e.message || "Something went wrong.");
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  async function submit(e) {
    e.preventDefault();
    if (!rsvp) return;
    setBusy(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || ""}/api/rsvp/${token}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rsvp, meal: rsvp === "yes" ? meal : "" })
      });
      if (!res.ok) throw new Error("Could not save your RSVP. Please try again.");
      setDone(true);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (err) return (
    <div className="rsvp-wrap">
      <div className="rsvp-card">
        <h1>Hmm.</h1>
        <p>{err}</p>
      </div>
    </div>
  );

  if (!guest) return null;

  if (done) return (
    <div className="rsvp-wrap">
      <div className="rsvp-card">
        <div className="eyebrow">Wedding RSVP</div>
        <h1>Thank you, <em>{guest.name}</em>!</h1>
        <p className="sub">Your response has been saved. We can't wait to celebrate with you.</p>
        <p className="hint">You can close this page — or come back through the same link to change your answer any time.</p>
      </div>
    </div>
  );

  return (
    <div className="rsvp-wrap">
      <div className="rsvp-card">
        <div className="eyebrow">Wedding RSVP</div>
        <h1>Hi <em>{guest.name}</em></h1>
        <p className="sub">
          You're invited to the <strong>{guest.event === "Both" ? "Vancouver civil AND Colombia catholic" : guest.event}</strong> {guest.event === "Both" ? "ceremonies" : "ceremony"}. Will you be joining us?
        </p>
        <form onSubmit={submit}>
          <div className="rsvp-choices">
            <label className={`rsvp-choice ${rsvp === "yes" ? "chosen yes" : ""}`}>
              <input type="radio" name="rsvp" value="yes" checked={rsvp === "yes"} onChange={() => setRsvp("yes")} />
              <span>Yes, I'll be there</span>
            </label>
            <label className={`rsvp-choice ${rsvp === "no" ? "chosen no" : ""}`}>
              <input type="radio" name="rsvp" value="no" checked={rsvp === "no"} onChange={() => setRsvp("no")} />
              <span>Sorry, can't make it</span>
            </label>
          </div>
          {rsvp === "yes" && (
            <>
              <label className="fld">Any dietary needs? (optional)</label>
              <input
                type="text"
                value={meal}
                onChange={(e) => setMeal(e.target.value)}
                placeholder="e.g. Vegetarian, gluten-free, no shellfish"
                maxLength={200}
              />
            </>
          )}
          <button className="primary" type="submit" disabled={!rsvp || busy}>
            {busy ? "Saving…" : "Submit RSVP"}
          </button>
        </form>
      </div>
    </div>
  );
}
