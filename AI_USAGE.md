AI Usage Log

This document describes how AI tools were used during development. It is intended to satisfy the requirement to document AI assistance.

Summary
- AI tools used: Windsurf
- Scope: targeted implementation assistance and validation support
- Human ownership: all final decisions, code changes, and tests were made and verified by the author

How AI Was Used
- Requirements digestion and checklisting for the technical test
- Architecture suggestions (component breakdown, routing, state management with Pinia)
- Implementation assistance (Nuxt 4 data fetching patterns, GraphQL query shaping)
- UI feedback (layout, responsive and mobile-first adjustments)
- Test guidance (Vitest setup and candidate unit test cases)
- Documentation help (README structure and submission notes)

What Was Not Delegated To AI
- Final code integration and refactors
- Debugging and issue triage
- Feature prioritization and tradeoff decisions
- Final QA and verification before submission

Attribution Notes
- No code or assets were copied verbatim from AI output without review and modification.
- All AI suggestions were validated against the project requirements and Nuxt/Vue/Tailwind/Pinia/Vitest documentation.

Change Log
- 2026-03-14: Initial AI usage log created.
- 2026-03-14: Added implementation support for app shell, GraphQL data composable, Pinia stores (favorites and preferences), characters table/profile pages, query-state back navigation, and Vitest unit tests.
- 2026-03-14: Assisted with environment debugging and package manager migration from pnpm to npm due native dependency resolution issues.
- 2026-03-15: Assisted with modular refactors for characters page composables and component test setup/validation.
