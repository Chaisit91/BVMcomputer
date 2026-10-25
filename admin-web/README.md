# admin-web

Admin dashboard for BVMcomputer — React + TypeScript + Vite, talking to [Backend-web](../Backend-web/README.md) over HTTP. No backend code lives here; every page calls a real API.

## Setup

```bash
npm install
cp .env.example .env   # VITE_API_URL — defaults to /api, proxied to Backend-web in dev
npm run dev             # http://localhost:5173
```

Backend-web must be running (see its own README) — most pages fail to load data otherwise.

## Structure

- `src/pages/` — one folder per feature, usually `*ListPage` / `*CreatePage` / `*EditPage`
- `src/components/` — `ui/` (generic, reusable), plus feature-specific folders (`layout/`, `dashboard/`, `inventory/`)
- `src/services/` — one file per feature, wraps the matching Backend-web API, maps API shapes to the frontend's own types
- `src/schemas/` — Zod validators, paired with React Hook Form via `@hookform/resolvers`
- `src/types/` — one file per feature, independent of (not auto-generated from) Backend-web's types
- `src/lib/permissions.ts` — which routes/nav items each `AdminRole` can see. **UX only** — Backend-web enforces the real access control independently; never rely on this file alone for security.
- `src/routes/AuthRouter.tsx` — all routes; `ProtectedRoute` gates everything except `/login`, `/forgot-password`, `/set-password`

## Auth & roles

Login sets an httpOnly session cookie (no tokens in JS). Four roles: `super_admin` (sees everything), `inventory_manager`, `sales_staff`, `content_moderator` (each scoped to their own section). A `isTeamLead` flag on top of a role grants edit rights over teammates sharing that same role. Full flow documented in [Backend-web/README.md](../Backend-web/README.md).

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — typecheck (`tsc -b`) + production build
- `npm run lint` — oxlint
