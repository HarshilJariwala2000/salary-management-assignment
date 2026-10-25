# 10: Docker image and compose file

**What to build:** A reviewer runs one command and gets the working app, filled with data. Edits survive a container restart.

**Blocked by:** 02 (Browse employees; needs migrations plus seed-if-empty on boot)

**Status:** ready-for-agent

- [ ] Multi-stage build on `node:22-slim` (not Alpine, because `better-sqlite3` is a native module). Build tools exist only in the build stage
- [ ] The runtime image contains only the compiled API, the static web files and production dependencies
- [ ] Runs as a non-root user, with a `HEALTHCHECK` on the health endpoint
- [ ] Reads `PORT` and `DATABASE_PATH` from the environment; the database file lives on a mounted volume (default under `/data`)
- [ ] On boot, the app runs migrations, then seeds only if there are no employees
- [ ] `docker compose up` starts the image with a named volume. Verified by hand: data is present; an edit survives `docker compose restart`
