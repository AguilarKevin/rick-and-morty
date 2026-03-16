# Rick and Morty Directory

Nuxt 4 app for browsing Rick and Morty characters, with filtering, favorites, and a profile view.

## Setup Instructions (Run Locally)

### 1) Install dependencies

```bash
npm install
```

### 2) (Optional) Fetch latest GraphQL schema snapshot

```bash
npm run graphql:schema:fetch
```

This stores a local schema at `graphql/schema.graphql`.

### 3) Start development server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

### 4) Run checks

```bash
npm run lint
npm run typecheck
npm run test
```

## Approach, Decisions, and Tradeoffs

- Used Nuxt 4 + Vue 3 Composition API with `<script setup>` for a simple, modern SPA-style architecture.
- Applied a container/presentational split on the characters page:
  - container (`app/pages/index.vue`) owns routing, fetch, and state
  - presentational components in `app/components/characters/*` handle UI and emits
- Used GraphQL AST documents in `app/graphql/queries.ts` instead of raw inline strings to keep operations centralized and easier to maintain.
- Added API request protections in the GraphQL composable:
  - in-flight request deduplication
  - TTL in-memory cache
  - retry/backoff for `429` responses
- Image strategy tradeoff:
  - kept optimized image usage scoped to the profile page
  - used standard images in high-volume list views to reduce request pressure and avoid rate-limit issues.
