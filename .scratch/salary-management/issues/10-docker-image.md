# 10: Docker image and compose file

**What to build:** A reviewer runs one command and gets the working app, filled with data. Edits survive a container restart.

**Blocked by:** 02 (Browse employees; needs migrations plus seed-if-empty on boot)

**Status:** ready-for-human

- [x] Multi-stage build on `node:22-slim` (not Alpine, because `better-sqlite3` is a native module). Build tools exist only in the build stage
- [x] The runtime image contains only the compiled API, the static web files and production dependencies
- [ ] Runs as a non-root user, with a `HEALTHCHECK` on the health endpoint
- [x] Reads `PORT` and `DATABASE_PATH` from the environment; the database file lives on a mounted volume (default under `/data`)
- [x] On boot, the app runs migrations, then seeds only if there are no employees
- [ ] `docker compose up` starts the image with a named volume. Verified by hand: data is present; an edit survives `docker compose restart`

## Comments

Written but **not yet run**: Docker isn't installed on the development machine. What was verified instead:

- The API is now bundled with esbuild (`npm run build`), so production runs on plain `node` with no tsx. The bundle was run by hand: it serves the UI and API, seeds 10k employees on an empty database, and answers the insights queries.
- It was also run against **production-only** dependencies (`npm ci --omit=dev --workspace=@salary/api`), the same set the image installs: healthy, with no dev tools present (about 116 MB of node_modules).
- Running the bundle found a real bug: a relative `WEB_DIST` crashed `@fastify/static`. Paths from the environment now resolve against the working directory.

Still to do by a human, with Docker available:

- [ ] `docker compose up --build`, then open http://localhost:3000: data present, `/health` ok, the container reports healthy
- [ ] Make an edit, `docker compose restart`, and confirm the edit is still there
- [ ] Confirm the process runs as `node`, not root (`docker compose exec app whoami`)
