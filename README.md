# cyient-app

The front ends of the Cyient DLM workflow applications: one React app per backend API, sharing one theme, one set of components, one API client and one way of signing in. The backend is the `Cyient.DLM` repository.

| App | Folder | For the API | Dev address | Base path (email links) | Docker API |
|---|---|---|---|---|---|
| Document Change Request | `apps/dcr-app` | DCR (BRD-05) | http://localhost:4201/dcr/ | `/dcr/requests/{id}` | http://localhost:5555 |
| Deviation Note | `apps/dn-app` | Deviation Note (BRD-03) | http://localhost:4202/dn/ | `/dn/requests/{id}` | http://localhost:7777 |
| Customer Complaint | `apps/cc-app` | Customer Complaint (BRD-04) | http://localhost:4203/cc/ | `/cc/complaints/{id}` | http://localhost:2222 |
| Engineering Change Note and TCN | `apps/ecn-app` | ECN (BRD-06); one API serves ECNs and TCNs | http://localhost:4204/ecn/ | `/ecn/notes/{id}` | http://localhost:8888 |
| MPPL Escalation Tracker | `apps/mppl-app` | MPPL (BRD-07) | http://localhost:4205/mppl/ | `/mppl/issues/{id}` | http://localhost:9999 |

The apps follow the APIs one to one: each calls only its own API, and each page's address is the one the API's emails link to.

```text
cyient-app/
├── apps/                  one app per API, each with its own entry point, routes, .env and dist/
├── packages/
│   ├── api-client/        typed fetch client + types generated from each API's OpenAPI document
│   ├── shared-ui/         theme, AppProviders, sign-in, components, form fields, layout, administration pages
│   ├── shared-utils/      validators, business dates (IST), formatting, file saving
│   └── shared-config/     TypeScript, ESLint, Vite and Vitest settings
├── package.json · pnpm-workspace.yaml · turbo.json · tsconfig.json
```

## Getting started

Needs Node 22.12 or later and pnpm 10 (`npm install -g pnpm@10`).

```bash
pnpm install
pnpm dev
```

`pnpm dev` starts all five apps; start one with `pnpm --filter @cyient/dcr-app dev`. Each app reads its API address and sign-in from `apps/<app>/.env.development` (the Docker ports above, development sign-in). Put your own values in `apps/<app>/.env.local`; `.env.example` lists every setting.

**Running against the Docker backend.** In `Cyient.DLM`, run `docker compose up -d --build`. Each API accepts calls from its own front end, so tell the backend these addresses in a `.env` file next to its `docker-compose.yml`, then run `docker compose up -d` again:

```text
DLM_DCR_FRONTEND_URL=http://localhost:4201
DLM_DN_FRONTEND_URL=http://localhost:4202
DLM_CC_FRONTEND_URL=http://localhost:4203
DLM_ECN_FRONTEND_URL=http://localhost:4204
DLM_MPPL_FRONTEND_URL=http://localhost:4205
```

The same addresses make the emails' links (read them at http://localhost:3333) open the right app.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | All apps with hot reload |
| `pnpm build` | Production build of every app into `apps/<app>/dist` |
| `pnpm lint` · `pnpm typecheck` · `pnpm test` | ESLint (type-checked rules), TypeScript strict, Vitest |
| `pnpm check` | All of the above, as CI should run them |
| `pnpm generate:api` | Regenerates the API types from the snapshots in `packages/api-client/openapi/`; add `-- --from-api` to fetch them from the running APIs first |

Every command runs per package through Turborepo, so one app can be built, tested or checked on its own: `pnpm --filter @cyient/mppl-app build`.

## Sign-in

`VITE_AUTH_MODE` matches the API's `Platform:Authentication:Mode`:

- **`entra`** (the servers): Microsoft sign-in with MSAL. Set `VITE_ENTRA_CLIENT_ID` (the "Cyient DLM Web" registration), `VITE_ENTRA_TENANT_ID` and `VITE_ENTRA_SCOPE` (the app's API, for example `api://cyient-dlm-dcr/access_as_user`). Each call carries the access token for the app's own API. Register each app's address as a redirect URI (see `docs/SignIn.md` in `Cyient.DLM`).
- **`development`** (Docker and local APIs only): no password; the `X-Dev-User` header names the person to act as. The account menu has **Act as someone else** with the API's sample people.

After sign-in the app loads `/api/v1/me`: the person's roles, permission codes and Pending Actions count come from the app's own API. Pages, buttons and menu items appear only for the permissions the API grants (`RequirePermission`, `useAuth().can(...)`); the API checks again on every call.

## How the code is organised

- **API client** (`packages/api-client`). The types are generated from each API's OpenAPI document, so a path, parameter, body or response field the API doesn't have is a compile error. `createApiClient<paths>(http)` gives `get/post/put/patch/delete/download` with typed `data`; every response's envelope (`success`, `data`, `message`, `errors`, `meta`, `traceId`) is unwrapped, and a failure becomes an `ApiError` with the API's message, error codes, field errors and trace ID. Native `fetch`; JSON and FormData; AbortSignal from TanStack Query.
- **Server state** lives only in TanStack Query: each feature has `keys.ts` (query keys), `queries.ts` and `mutations.ts`; mutations update or invalidate exactly what they changed. Changes send the record's `version`; a 409 (someone saved in between) reloads it.
- **Forms** use React Hook Form with the shared `Form*` fields (`Controller` + `useFormContext`) and the validators in `shared-utils`, mirroring the API's own rules and messages. The API's field errors are placed on the fields with `applyServerErrors`. No Zod.
- **Lists** keep page, sort and filters in the address (`useListState`), so a filtered list can be bookmarked or shared.
- **Styling** is MUI only: the theme in `packages/shared-ui/src/theme` (colours, palette, typography, breakpoints, component overrides; light and dark), `sx` and `styled`. No CSS files.
- **Administration** (roles, users, master lists, audit, emails, logs, jobs, numbering) is the same in every API and lives once in `@cyient/shared-ui/admin`; each app mounts it at `/admin`. App-specific management (open reviews, cancel, correct, reviewer boxes, sourcing master...) lives in the app under `/manage`.

## Building for the servers

`pnpm build` writes each app to `apps/<app>/dist`, built for its base path (`VITE_BASE_PATH`, default `/<app>/`). Serve each `dist` folder at that path (for example as an IIS application at `/dcr`) with a fallback to its `index.html` for unknown paths, so links such as `/dcr/requests/{id}` open the app. Set the `VITE_*` values for the server at build time; none of them is secret.
