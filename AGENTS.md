# AGENTS Instructions

Scope: entire repository.

## Source of Truth
- Treat `PROJECT_CONTEXT.md` as the primary product requirements and delivery rubric.
- Treat `AI_USAGE.md` as the required disclosure log for AI-assisted development.

## Technical Constraints
- Use Nuxt 4 + Vue 3 Composition API with `<script setup>` only.
- Do not use Vue Options API.
- Use Tailwind utility classes for styling.
- Use Pinia for global state.
- Use GraphQL for Rick and Morty data fetching.
- Use Vitest for unit tests.

## Required Product Features
- Characters table page with API pagination (20/page), search by name (debounced), and row navigation to profile.
- Character profile page at `/character/:id` with full details and back navigation preserving page/search state.
- Favorites from table and profile, persisted in `localStorage` via Pinia, with indicator and favorites view/filter.
- Dark/light mode toggle persisted in `localStorage`.
- Unit tests for at least two targets (store/util/component).

## UX / UI Expectations
- Mobile-first implementation.
- Responsive across screen sizes.
- Consistent visual language.
- Prioritize polished, production-ready UI and avoid over-engineering.

## AI Usage Documentation Rules
- Keep `AI_USAGE.md` updated whenever AI materially contributes.
- Log: tools used, scope, what was not delegated, attribution/validation notes, and date-based change log entries.
- Human remains owner of final decisions, code integration, debugging, and QA.

## Collaboration Rules for AI Agents
- Make focused, minimal changes aligned to requirements.
- Preserve and update project docs (`README.md`, `AI_USAGE.md`) as work evolves.
- Prefer correctness and clarity over unnecessary complexity.
