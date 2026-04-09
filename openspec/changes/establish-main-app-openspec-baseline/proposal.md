# Proposal: Establish Main App OpenSpec Baseline

## Why

The repository currently has broad documentation in `docs/`, but it does not yet have a structured OpenSpec baseline for the main site.
That makes it harder to:

- discuss changes against a stable current-state specification
- distinguish current behavior from planned behavior
- keep multi-page workflows aligned when changes span routing, stores, and shared inputs
- preserve repo-specific constraints such as path-first routing, i18n discipline, and Chinese text safety

## What Changes

This change establishes the first OpenSpec baseline for the main app by adding:

- `openspec/project.md` with repository-level context and conventions
- main-app source specs under `openspec/specs/`
- a baseline change folder that records the intent, scope, and initial spec deltas

The baseline covers the current main app route surface, including:

- `/`
- `/menu/*`
- `/explore/*`
- `/auth*`
- `/intro`
- the main-side bridge to `/villagesML`

## Non-Goals

This change does not:

- fully specify the internal VillagesML runtime
- convert placeholder features into promised future behavior
- rewrite existing architecture docs, API docs, or user guides
- change production application behavior or routing

## Scope Notes

- Main-app-first is intentional.
- Shared main-app capabilities are specified separately from page-level workflows when they are reused across multiple routes.
- `dialect clustering` is recorded as a real route with a placeholder UI, not as a completed clustering feature.
