# Module layout

Each domain module is split into four layers. Keep logic in the layer it belongs to — don't let one leak into another.

| Layer | File | Owns | Never contains |
|---|---|---|---|
| Model | `<name>.model.ts` | The Prisma delegate(s) for this entity (`export const X = prisma.x`), the matching generated type (`export type { XRecord }`), and entity-level invariants — validation rules that describe "what makes this row valid" regardless of who's writing it (e.g. `assertValidBannerDates`). | Express, HTTP, business workflow. |
| Repository | `<name>.repository.ts` | Plain data access: CRUD and queries built on the delegates from its own `model.ts`. | Business rules, auth checks, external API calls. |
| Service | `<name>.service.ts` | Business logic / orchestration — combines repository calls, enforces workflow rules, calls external services. | Prisma, `req`/`res`. |
| Router | `<name>.router.ts` | HTTP only: parse `req`, call the service, shape the response. | Prisma, business rules. |

A repository only ever imports Prisma delegates from its own module's `model.ts` — never `prisma.x` directly, and never another module's Prisma table unless that table has its own `model.ts` to import from (e.g. `announcement.repository.ts` imports `AdminAccount` from `../admin/admin.model`, not a copy of its own).

## Two legitimate shapes

**Standard module** (admin, announcement, banner, chat, computer-upgrade, custom-build, customer, order, product) — all four files, as above.

**Generic category module** (case, cooling, cpu, desktop-pc, gpu, motherboard, promo-set, psu, ram, storage) — these all extend the shared `Product` entity (see `product/product.model.ts`) with at most one 1-1 subtype table, which Prisma writes through `Product`'s own nested `create`/`update`, never through a separate delegate call. There is nothing for these modules to put in a `model.ts` beyond `Product` itself, so:
- Structurally simple ones (case, cooling, gpu, motherboard, psu, ram, storage) share one generic `repository.ts` built by `lib/categoryRepository.ts` — no per-module `model.ts`.
- Ones with real category-specific columns or tables beyond that (cpu, desktop-pc, promo-set) still get their own `model.ts`, but it imports `Product` from `../product/product.model` rather than redeclaring it, and only owns its own extra delegates (e.g. `cpu.model.ts` owns `ProductVideoLink`/`CpuBenchmark`).

## Modules with no table of their own

- **auth** — no separate `User` entity; login is admin login, so `auth.router.ts` calls `adminRepository`/`adminService` directly instead of duplicating a second data-access layer over `AdminAccount`.
- **ai** — calls an external AI API, not the DB (see `ai.service.ts`); its one DB read (`catalog.router.ts`) goes through `product/product.model.ts` like everything else that reads `Product`.
