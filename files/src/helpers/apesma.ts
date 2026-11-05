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

// A plain Home Assistant login (the Echo Show "Moon") can't use the ingress (admins only), so its page goes straight to
// Music Assistant's own address (https only, e.g. https://ma.proflewis.stream) as a plain MA user: the page that opens
// apesma puts that address in localStorage "apesma_server" and the user's MA token where this app keeps it, every time
// it opens (that browser keeps nothing between launches).
const DIRECT_KEY = "apesma_server";
export const apesmaDirect: string | null = (() => {
  if (apesmaIngress) return null;
  try {
    const v = localStorage.getItem(DIRECT_KEY);
    return v && /^https:\/\/[A-Za-z0-9.-]+(:\d+)?$/.test(v) ? v : null;
  } catch {
    return null;
  }
})();

/** The Music Assistant server's address: through HA's ingress, or straight to it (apesmaDirect), else where this page came from (upstream). */
export function apesmaServerBase(): string {
  if (apesmaIngress) return window.location.origin + apesmaIngress.replace(/\/$/, "");
  if (apesmaDirect) return apesmaDirect;
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

/** Your own players (the decks + visualisations) or search, from the Peach Banana panel: apesma runs inside the panel's
 *  apesma page, which lays the house's real Music cards over this app (one copy of each player, here and on the Music
 *  page). On its own (not inside the panel) it goes to the Music page instead. */
export function apesmaShow(what: "players" | "search", player?: string): void {
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ apesma: "show", what, player: player || "" }, window.location.origin);
      return;
    }
  } catch {
    /* (not the same site) */
  }
  window.location.href = "/control-panel/music";
}
