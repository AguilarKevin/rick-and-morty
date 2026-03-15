# Rick and Morty Directory

A Nuxt 4 technical challenge project built with Vue 3 Composition API, Tailwind CSS, Pinia, GraphQL, and Vitest.

## Tech Stack

- Nuxt 4 + Vue 3 (`<script setup>`)
- Tailwind CSS
- Pinia (global state + `localStorage` persistence)
- Rick and Morty GraphQL API (`https://rickandmortyapi.com/graphql`)
- Vitest

## Implemented Features

- Characters table page with:
  - API pagination (20 per page)
  - Debounced search by name
  - Row navigation to character profile
- Character profile page at `/character/:id` with:
  - Full detail view
  - Back navigation preserving page/search/favorites query state
- Favorites:
  - Toggle from table and profile
  - Persisted in `localStorage` via Pinia
  - Favorites-only filter view
- Dark/light mode toggle persisted in `localStorage`
- Unit tests:
  - `debounce` utility
  - favorites Pinia store logic

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Runs at `http://localhost:3000`.

## Quality Checks

```bash
npm run test
npm run lint
npm run typecheck
```

## Build

```bash
npm run build
npm run preview
```
