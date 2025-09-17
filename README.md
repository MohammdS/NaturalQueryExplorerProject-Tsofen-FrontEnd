# Natural Query Explorer – Frontend

React + Vite frontend for querying SQLite databases with natural language.

## Features Implemented

- Auth flow (signup + email verification, signin, me)
- Database management (upload, list, delete, select; max 5 enforced by backend)
- Schema viewing (tables + columns)
- NL prompt → SQL generation (`/api/query/generate`)
- SQL editing + safety warning handling
- SQL execution (`/api/query/execute`) with result meta (duration, truncation, applied limit)
- CSV export (client side)

## Environment

Create a `.env` file based on `.env.example`:

```
VITE_API_BASE_URL=http://localhost:3000
```

## Install & Run

```
npm install
npm run dev
```

Then open the shown localhost URL (default: http://localhost:5173).

Backend must be running at `VITE_API_BASE_URL`.

## Auth Notes

1. Sign Up → verification modal opens immediately. Enter email code.
2. On verify success token is stored and DB list loads.
3. Sign In stores token directly.
4. Token stored under `auth_token` in `localStorage`.

## Query Flow

1. Upload or select an existing DB.
2. Schema auto-loads.
3. Enter natural language prompt → Generate SQL.
4. Review/edit SQL. If flagged unsafe, acknowledge checkbox to enable Execute.
5. Execute → view results table + duration + truncation badge.
6. Export CSV if desired.

## Future (Not Implemented Yet)

- Persistent history
- Query explanations
- Advanced schema relations view
- Backend-powered export endpoint

---

Built with Vite + React 19.
