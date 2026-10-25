# Backend-web

API server for BVMcomputer's [admin-web](../admin-web/README.md). Node + Express + TypeScript + Prisma, PostgreSQL via Supabase. The storefront and AI compatibility service are separate projects maintained by other teammates — this repo never touches their code.

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, DIRECT_URL, JWT_SECRET, RESEND_API_KEY, etc.
npx prisma migrate dev # applies prisma/migrations/ to your database
npm run dev             # http://localhost:8080
```

## Module layout

Every feature lives under `src/modules/<name>/` as up to three files:

- `<name>.router.ts` — Express routes only (parsing/validation + calling the service)
- `<name>.service.ts` — business logic, orchestrates repository calls
- `<name>.repository.ts` — the only place that calls `prisma.*` directly for that model

A module needing an unauthenticated endpoint (for the future storefront) gets a second `<name>-public.router.ts` instead of branching auth inside the main router — see `computer-upgrade-public.router.ts` / `chat-public.router.ts`. Shared code: `src/lib/` (Prisma client, errors, catalog helpers), `src/middleware/` (auth, role, error handling), `src/utils/` (jwt, password hashing, email, tokens), `src/schemas/` (Zod validators).

## Auth & roles (RBAC)

- Session is a JWT in an httpOnly cookie (`bvm_session`), issued by `POST /api/auth/login`. No separate refresh token — `/api/auth/refresh` re-signs off the still-valid cookie.
- `authMiddleware` rejects if `AdminAccount.sessionsInvalidatedAt` is newer than the token's issue time — that's how a force-logout works without a server-side session store.
- Four roles (`AdminRole`): `super_admin` (passes every check, manages all accounts), `inventory_manager`, `sales_staff`, `content_moderator`. `requireRole(...)` / `requireSelfOrRole(...)` (`middleware/roleMiddleware.ts`) gate routes.
- `index.ts` defines one middleware array per department and mounts each module's router with it — mirrors `admin-web/src/lib/permissions.ts` exactly; keep the two in sync when adding a department-scoped route.
- `isTeamLead` grants a department lead edit rights over teammates sharing their own role (never across departments, never over another team lead) — see `admin.router.ts`'s `isPeerTeamLead`.

## Database

- Prisma client is generated to `./generated/prisma` (not the default `@prisma/client` location) — import it via `src/lib/prisma.ts`; any one-off script needs the same import path.
- **Schema changes go through `npx prisma migrate dev --name <description>`** — this keeps `prisma/migrations/` an accurate changelog. Never `prisma db push` against the real database.
- `migrate dev` / `migrate diff` need the **direct, non-pooled** connection — use `DIRECT_URL`, not `DATABASE_URL` (Supabase's pgbouncer pool hangs on these operations instead of erroring).
- `prisma/manual/constraints.sql` holds CHECK constraints and a partial unique index Prisma's schema language can't express — not applied by migrations, re-run by hand after a reset (`npx prisma db execute --file prisma/manual/constraints.sql --schema prisma/schema.prisma`).
- **Windows**: `prisma generate` fails with `EPERM` on the query engine DLL if the dev server is still running (it has the old one loaded). Stop the dev server first, run the Prisma command, then restart.

## Data model notes

- **`Product` is the shared row for everything sellable** — the 8 part categories and 2 bundle types (`desktop_pc`, `promo_set`) are all `Product` rows; category tables (`Cpu`, `Gpu`, ...) hold only what's left after centralizing shared fields onto `Product`.
- **Snapshot fields are intentional** — `Order.customerName`, `OrderLineItem.unitPrice`, `CustomBuildComponent.price`, etc. freeze what was true at checkout/build/quote time, independent of later profile or catalog-price edits. Don't normalize these away.
- **Derived values are never stored** — stock-status buckets, a banner's expired flag, and `discount` are all computed at read time so they can't drift out of sync with their source fields.

## Email

`src/utils/email.ts` wraps Resend. In sandbox mode (no verified domain), delivery only works to the exact, case-sensitive address the Resend account was signed up with.
