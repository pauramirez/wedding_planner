import { useState } from "react";
import { auth } from "../lib/api.js";

export default function AuthGate({ onSignedIn }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = mode === "login"
        ? await auth.login(email, password)
        : await auth.register(email, password, name);
      onSignedIn(res.user);
    } catch (e) {
      setErr(e.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Dos Bodas, <em>Una Historia</em></h1>
        <p className="sub">{mode === "login" ? "Sign in to your shared planner." : "Create an account — everyone shares the same wedding data."}</p>
        <form onSubmit={submit}>
          {mode === "register" && (
            <>
              <label>Your name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
            </>
          )}
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} />
          <button className="primary" type="submit" disabled={busy}>
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
          {err && <div className="err">{err}</div>}
        </form>
        <div className="switch">
          {mode === "login" ? "New here? " : "Already have an account? "}
          <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setErr(null); }}>
            {mode === "login" ? "Create an account" : "Sign in instead"}
          </button>
        </div>
      </div>
    </div>
  );
}
