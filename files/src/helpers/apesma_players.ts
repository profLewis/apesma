// APESMA (profLewis): THE HOUSE'S OWN PLAYERS ARE apesma's PLAYER (the user, 5 Nov 2026: "apesma player is NOTHING like the
// valve radio player or the other players ... I thought that was the idea"). Inside the Peach Banana panel, whatever would
// open Music Assistant's own "now playing" (the player bar tapped, the now-playing button) opens the house's player
// instead - the valve radio, turntable, cassette… whichever style is chosen - on the speaker apesma is playing on.
// Opened on its own (not in the panel), Music Assistant's own player is kept.
import { watch } from "vue";
import { apesmaShow } from "@/helpers/apesma";
import { store } from "@/plugins/store";

const inPanel = (() => {
  try {
    return window.parent !== window && !!window.parent.document;
  } catch {
    return false;
  }
})();

if (inPanel) {
  watch(
    () => store.showFullscreenPlayer,
    (open) => {
      if (!open) return;
      store.showFullscreenPlayer = false;
      apesmaShow("players", store.activePlayerId);
    },
  );
}
