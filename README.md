# Wildlife Conservation & Biodiversity Monitoring Platform

A role-based web app for managing species and habitat records, field sightings, incidents, conservation projects, and research observations.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- Docker Desktop with the Docker engine running

The included Compose file starts a development MongoDB instance bound to the local machine only. Its data persists in the `wildlife_mongo_data` Docker volume.

## First run

1. Copy `backend/.env.example` to `backend/.env` and set a private JWT secret plus an administrator name, email, and strong password.
2. Copy `frontend/.env.example` to `frontend/.env.local` if you need to change the local API URL.
3. Run `npm run setup` from this folder.
4. Start Docker Desktop, then run `npm run dev`.
5. Open <http://127.0.0.1:5173>. The API responds at <http://127.0.0.1:5000/>.

`npm run dev` starts MongoDB, the Express API, and the Vite development server. Press Ctrl+C to stop the API and web server. Stop MongoDB separately with `npm run db:down`; that keeps its stored data.

## Other commands

- `npm run build` builds the frontend for production.
- `npm run lint` runs the frontend linter.
- `npm run start:api` starts only the backend; MongoDB must already be running.

The backend reads `backend/.env`. The Vite frontend reads `frontend/.env.local`. Keep those files and database uploads out of version control; the repository ignores environment files, dependencies, build output, and runtime uploads.
