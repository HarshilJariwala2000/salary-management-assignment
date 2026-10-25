# 12: Deploy to a public host

**What to build:** The app is reachable on a public URL, with data that survives restarts, as the brief requires ("fully functional deployed software").

**Blocked by:** 10 (Docker image and compose file)

**Status:** ready-for-human

- [x] Choose a host: Render free plan via `render.yaml`. No free host offers a persistent volume, so edits reset on restart (D-017)
- [ ] Create the Render account and apply the Blueprint from the GitHub repo
- [ ] Deploy the image (no volume on the free plan; boot reseeds the empty database)
- [ ] Verify by hand: the public URL loads with seeded data; `/health` is ok. (Edits surviving a restart is out of reach on the free plan, see D-017)
- [ ] Add the public URL to the README
