# BVMcomputer

Admin web app for BVMcomputer, split into two services:

- **Backend-web** — Node + Express + TypeScript + Prisma (PostgreSQL via Supabase). See [Backend-web/README.md](Backend-web/README.md).
- **admin-web** — React + TypeScript + Vite. See [admin-web/README.md](admin-web/README.md).

The storefront and AI compatibility service are separate projects maintained by other teammates and aren't part of this repo.

## Running locally

Each service has its own `.env.example` — copy to `.env` and fill in the real values (Supabase connection strings, JWT secret, Resend API key, etc.) before starting either one.

```bash
# Terminal 1
cd Backend-web
npm install
npx prisma migrate dev  # applies prisma/migrations/ to your database
npm run dev              # http://localhost:8080

# Terminal 2
cd admin-web
npm install
npm run dev              # http://localhost:5173
```
