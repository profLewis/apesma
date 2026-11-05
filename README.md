# apesma

Music Assistant's own web app (github.com/music-assistant/frontend), rebuilt with the house's changes - a 🍌 **Peach
Banana** button, and talking to Music Assistant through Home Assistant's ingress - and served by Home Assistant at
`/local/apesma/`.

- `transform.mjs` - every change, as a named edit that fails loudly if an upstream release moves its spot.
- `files/` - our own new files, copied into the app.
- `.github/workflows/build.yml` - builds the app version the latest Music Assistant release uses: daily check, weekly
  rebuild, or on demand. Each build is a release `apesma-<app version>` with `apesma.zip`.
- The house fetches the release matching its own Music Assistant (`device_master/apesma_update.py`).
