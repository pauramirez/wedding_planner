// Loads Datadog RUM if the env vars are set. Otherwise no-op.
// Uses the CDN script so we don't add a dep until it's actually configured.

export function initRum() {
  const appId = import.meta.env.VITE_DD_RUM_APP_ID;
  const token = import.meta.env.VITE_DD_RUM_CLIENT_TOKEN;
  if (!appId || !token) return;

  const s = document.createElement("script");
  s.src = "https://www.datadoghq-browser-agent.com/us1/v5/datadog-rum.js";
  s.crossOrigin = "anonymous";
  s.onload = () => {
    if (!window.DD_RUM) return;
    window.DD_RUM.init({
      applicationId: appId,
      clientToken: token,
      site: "datadoghq.com",
      service: "wedding-planner-web",
      env: import.meta.env.VITE_DD_ENV || "dev",
      version: "0.1.0",
      sessionSampleRate: 100,
      sessionReplaySampleRate: 20,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: "mask-user-input"
    });
    window.DD_RUM.startSessionReplayRecording();
  };
  document.head.appendChild(s);
}
