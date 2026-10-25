# 10: Docker image and compose file

**What to build:** A reviewer runs one command and gets the working app, filled with data. Edits survive a container restart.

**Blocked by:** 02 (Browse employees; needs migrations plus seed-if-empty on boot)

**Status:** done

- [x] Multi-stage build on `node:22-slim` (not Alpine, because `better-sqlite3` is a native module). Build tools exist only in the build stage
- [x] The runtime image contains only the compiled API, the static web files and production dependencies
- [x] Runs as a non-root user, with a `HEALTHCHECK` on the health endpoint
- [x] Reads `PORT` and `DATABASE_PATH` from the environment; the database file lives on a mounted volume (default under `/data`)
- [x] On boot, the app runs migrations, then seeds only if there are no employees
- [x] `docker compose up` starts the image with a named volume. Verified by hand: data is present; an edit survives `docker compose restart`

## Comments

Written before Docker was available on the development machine. What was verified first:

- The API is now bundled with esbuild (`npm run build`), so production runs on plain `node` with no tsx. The bundle was run by hand: it serves the UI and API, seeds 10k employees on an empty database, and answers the insights queries.
- It was also run against **production-only** dependencies (`npm ci --omit=dev --workspace=@salary/api`), the same set the image installs: healthy, with no dev tools present (about 116 MB of node_modules).
- Running the bundle found a real bug: a relative `WEB_DIST` crashed `@fastify/static`. Paths from the environment now resolve against the working directory.

Then run with Docker 28.5 (2026-10-26):

- [x] `docker compose up --build`: the UI returns 200, `/health` is ok, the container reports `healthy`, and the log shows 10,000 employees seeded
- [x] Deleted an employee (total 10,000 → 9,999), ran `docker compose restart`: still 9,999, that employee still gone, and no second seed
- [x] `docker compose exec app whoami` prints `node`
