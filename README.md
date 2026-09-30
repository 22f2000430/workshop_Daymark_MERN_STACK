# Daymark

Daymark is a MERN study planner for dated tasks, subjects, focus sessions, and weekly progress. The original root `index.html` is retained as a visual reference; the production app lives in `client/` and `server/`.

## Prerequisites

- Node.js 22 LTS or newer
- MongoDB 7+ locally, or a MongoDB Atlas database
- A database URI, JWT secret, and client origin

## Setup

```powershell
npm run install:all
Copy-Item .env.example .env
```

Edit `.env`:

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: long random signing secret
- `CLIENT_ORIGIN`: usually `http://localhost:5173`
- `PORT`: API port, default `5000`

Start both applications:

```powershell
npm run dev
```

The client is at `http://localhost:5173` and the API is at `http://localhost:5000/api/health`.

Run checks:

```powershell
npm test
npm run build
```

## API

The API uses JSON responses shaped as `{ data: ... }` and safe errors shaped as `{ error: { code, message, fields } }`. Authentication uses a signed `HttpOnly` cookie. Planner records are always scoped by the authenticated user; no request may provide an owner ID.

Available endpoints include `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/subjects`, `/api/tasks`, `/api/focus-sessions`, and `/api/analytics/weekly`.

## Render deployment

`render.yaml` defines separate Node and static-site services. Add `MONGODB_URI` and a generated `JWT_SECRET` in Render before deploying. Set the static site's `VITE_API_ORIGIN` to the API public URL and set the API's `CLIENT_ORIGIN` to the static-site URL. For a same-origin production deployment, configure the static site rewrite for `/api/*` to the API service and use the API URL as the client fetch origin.

Never commit the supplied database password or any `.env` file. Since credentials were included in a prompt, rotate that database user's password before using it outside local development.
