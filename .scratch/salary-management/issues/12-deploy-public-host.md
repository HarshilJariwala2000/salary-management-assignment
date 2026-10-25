# 12: Deploy to a public host

**What to build:** The app is reachable on a public URL, with data that survives restarts, as the brief requires ("fully functional deployed software").

**Blocked by:** 10 (Docker image and compose file)

**Status:** ready-for-human

- [ ] Choose a host that supports a persistent volume (e.g. Fly.io or Railway) and set up the account
- [ ] Deploy the image with a volume mounted at the database path
- [ ] Verify by hand: the public URL loads with seeded data; an edit survives a redeploy or restart
- [ ] Add the public URL to the README
