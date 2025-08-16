# API (apps/api)

A small TypeScript API service built on top of Reono's node server. It uses a JSX-based router and Zod for schema validation. This package currently exposes a simple Users domain backed by an in-memory repository, and a Todos domain.

## Tech stack

- Runtime/server: `@reono/node-server` + `reono`
- Language: TypeScript with JSX (`jsxImportSource: reono`)
- Validation: `zod`
- Package manager/workspace: PNPM in a monorepo

## Project layout

```
apps/api/
  package.json
  tsconfig.json
  src/
    index.tsx            # App entry; registers middleware and mounts routers
    users/
      repo.ts            # In-memory data store + Zod schemas + domain ops
      router.tsx         # Declarative HTTP routes for the Users domain
    todos/
      repo.ts            # In-memory data store + Zod schemas + domain ops
      router.tsx         # Declarative HTTP routes for the Todos domain
```

## Architecture overview

- Composition root: `src/index.tsx`
  - Creates the app via `createApp()` and mounts the component `<App />`.
  - `<App />` composes middleware with `<use handler={...} />` and mounts domain routers like `<UserRouter />` and `<TodoRouter />`.
  - A logging middleware (`logger`) measures duration and logs `METHOD URL (duration)`.
- Routing: JSX-first router primitives from Reono
  - `<router path="users">` scopes all user routes under `/users`.
  - `<router path="todos">` scopes all todo routes under `/todos`.
  - `<get>`, `<post>`, `<put>`, `<delete>` elements define HTTP verbs.
  - Each route can declare `validate` with Zod schemas for `params` and/or `body`.
  - Handlers receive a context `c` and typically return JSON with `c.json(...)`.
- Domain separation
  - Each domain's `repo.ts` holds Zod schemas, TypeScript types, and domain operations (CRUD) on an in-memory store.
  - Each `router.tsx` is thin: parse/validate input, call repo functions, serialize output.
- Types & validation
  - Path params are coerced with `z.coerce.number()` so `/users/1` or `/todos/1` become numbers.
- Error handling
  - Repos throw `Error` when entities are missing; consider adding centralized error middleware.

## Users API

Base path: `/users`

- GET `/users` → list all users
- GET `/users/:userId` → get a single user
  - Params: `{ userId: number }`
- POST `/users` → create a user
  - Body: `{ name: string }`
- PUT `/users/:userId` → update a user
  - Params: `{ userId: number }`
  - Body: `{ name: string }`
- DELETE `/users/:userId` → delete a user
  - Params: `{ userId: number }`

## Todos API

Base path: `/todos`

- GET `/todos` → list all todos
- GET `/todos/:todoId` → get a single todo
  - Params: `{ todoId: number }`
- POST `/todos` → create a todo
  - Body: `{ title: string, completed?: boolean }`
- PUT `/todos/:todoId` → update a todo (partial)
  - Params: `{ todoId: number }`
  - Body: `{ title?: string, completed?: boolean }`
- DELETE `/todos/:todoId` → delete a todo
  - Params: `{ todoId: number }`

Server listens on `http://localhost:3000` (see `src/index.tsx`).

## How requests flow

1. Request enters `createApp()` pipeline.
2. Global middleware runs (e.g., `logger`).
3. Router tree matches, validates input with Zod, and invokes the route handler.
4. Handler delegates to repo operations.
5. Response returned with `c.json(...)`.

## Local development

Prereqs: Node 18+ and PNPM installed. From the repo root:

- Install deps
  - `pnpm install`

- Run (Option A: use tsx)
  - Add dev dep and script in the root or this package:
    - `pnpm -w add -D tsx`
    - In `apps/api/package.json` scripts: `{ "dev": "tsx src/index.tsx" }`
  - Start: `pnpm --filter api dev`

- Run (Option B: use ts-node ESM)
  - `pnpm -w add -D ts-node typescript`
  - Scripts: `{ "dev": "node --loader ts-node/esm src/index.tsx" }`

- Run (Option C: build then run)
  - Add a bundler (e.g., `tsup`), build to `dist`, then `node dist/index.js`.

- Run (Option D: vite build/watch + wait-on + nodemon) [current setup]
  - Scripts:
    - `dev`: `run-p dev:build dev:serve`
    - `dev:build`: `vite build --watch`
    - `dev:serve`: `wait-on dist/index.js && nodemon --watch dist --ext js,json --delay 100ms --exec node dist/index.js`
  - This avoids a race where nodemon would start before the initial build output exists by waiting for `dist/index.js` to appear once, then handing off to nodemon which watches for subsequent rebuilds.

Note: `tsconfig.json` sets `jsxImportSource: reono` and `jsx: react-jsx` so the Reono JSX router compiles correctly.

## Adding a new domain

1. Create `src/<domain>/repo.ts` with Zod schemas, types, and operations.
2. Create `src/<domain>/router.tsx` with `<router path="<domain>">` and verb elements.
3. Import and mount the router in `src/index.tsx` inside `<App />`.
4. Add validation with Zod for `params` and/or `body`.

## Conventions

- Keep routers thin; put business logic and data access in repos.
- Validate all external inputs with Zod.
- Prefer `z.coerce` for path params.
- Return JSON via `c.json(...)` and consistent shapes.
- Add middleware at the top level with `<use handler={...} />`.

## Future improvements

- Persist data in a real database instead of in-memory store.
- Centralized error handling middleware with problem+json responses.
- Request/response logging and tracing.
- E2E tests against the router using a supertest-like client.
