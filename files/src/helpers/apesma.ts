// APESMA (profLewis) - this Music Assistant app, served by Home Assistant at /local/apesma/ and talking to Music Assistant
// through Home Assistant's ingress (the same way HA's own Music Assistant panel does), so it works at home and away
// behind the Home Assistant login. The page that opens it (the Peach Banana control panel) passes the ingress path as
// ?apesma_ingress=/api/hassio_ingress/<token>/ and has already made the ingress session cookie.

const KEY = "apesma_ingress";

export const apesmaIngress: string | null = (() => {
  try {
    const v = new URLSearchParams(window.location.search).get(KEY);
    if (v && /^\/api\/hassio_ingress\/[A-Za-z0-9_-]+\/?$/.test(v)) {
      sessionStorage.setItem(KEY, v);
      return v;
    }
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
})();

/** The Music Assistant server's address: through HA's ingress for apesma, else where this page came from (upstream). */
export function apesmaServerBase(): string {
  if (apesmaIngress) return window.location.origin + apesmaIngress.replace(/\/$/, "");
  return window.location.origin + window.location.pathname.replace(/\/$/, "");
}

/** Back to the Peach Banana control panel (the page around this one, or this tab if opened on its own). */
export function apesmaToPeachBanana(): void {
  const to = "/control-panel/music";
  try {
    if (window.top && window.top !== window) {
      window.top.history.pushState(null, "", to);
      window.top.dispatchEvent(new Event("location-changed"));
      return;
    }
  } catch {
    /* (not the same site: just go there) */
  }
  window.location.href = to;
}
