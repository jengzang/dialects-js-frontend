# Project Context

## Overview

This repository contains the frontend for "Chinese Dialect Atlas" (`方音圖鑑`).
The repo is split into two layers:

- Repository root: documentation, repository-level guidance, and OpenSpec artifacts
- `project/`: the runnable frontend workspace

The current frontend runtime is split into two coexisting applications:

- `project/src/main`: the main site
- `project/src/VillagesML`: the VillagesML sub-application

This OpenSpec baseline is intentionally main-app-first. It fully captures the current main site and only references VillagesML where the main site bridges into it.

## Product Surface

The main site currently exposes these route families:

- `/`: home page
- `/menu/*`: primary user workflows
- `/explore/*`: tools, data exploration, and reference resources
- `/auth*`: authentication and user-owned data workspaces
- `/intro`: standalone informational views
- `/villagesML/*`: external bridge into the separate VillagesML runtime

## Main App Capability Map

The main app baseline is organized around these capabilities:

- app shell and navigation
- auth and user workspace
- location and region selection
- query workflows
- compare workflows
- result presentation
- map visualization
- phonology analysis
- char-class exploration
- lexical and grammar resources
- villages exploration
- data tools
- Praat audio analysis
- support and about pages
- dialect clustering placeholder

## Tech Stack

- Vue 3 with Composition API and `<script setup>`
- Vue Router 4 with path-based canonical routes
- Vite 7 multi-entry frontend build
- Vue I18n with `zh-Hant`, `zh-CN`, and `en`
- MapLibre GL, ECharts, wavesurfer.js
- centralized API modules under `project/src/api`
- custom reactive stores under `project/src/main/store` and `project/src/utils`

## Architecture Notes

- Canonical page identity should be carried by path routes, not query parameters.
- The router still preserves legacy query-driven entry semantics through dedicated bridge components and route-mapping helpers.
- The main site and VillagesML share i18n resources, but remain separate runtimes.
- The main site reuses shared capabilities across multiple features, especially:
  - location and region selection
  - map/result data handoff
  - custom user data
  - query configuration schemas

## Source Of Truth Rules

- OpenSpec baselines in this repo describe the current behavior that exists in code now.
- Historical docs in `docs/` are helpful context, but they do not override current source files, current routing, or current runtime behavior.
- Placeholder or partially implemented features must be marked explicitly as placeholder/planned and must not be written as delivered capabilities.

## Change Control Expectations

These conventions are derived from the repo's working rules and must be preserved across future changes:

- Prefer minimal, targeted changes.
- Do not expand scope unless the user explicitly asks.
- Treat existing business logic as mature unless there is a user-requested reason to change it.
- Respect the current directory layout and recent refactors instead of assuming historical structure.
- Preserve backward compatibility where route bridges or old URL formats still exist.
- Do not casually rewrite copy, especially Chinese text.
- Protect literal Chinese and emoji content from encoding corruption.
- After implementation work, review the actual diff and confirm that only requested changes were introduced.

## Documentation And I18n Expectations

- New UI copy should normally be added to all three locales:
  - `project/src/i18n/locales/zh-Hant`
  - `project/src/i18n/locales/zh-CN`
  - `project/src/i18n/locales/en`
- Existing `docs/` remain repository documentation, not the OpenSpec source-of-truth tree.
- OpenSpec files live under `openspec/` and are the structured specification layer for ongoing changes.

## Main App Scope Boundary

This baseline fully covers the main app:

- `/menu/*`
- `/explore/*`
- `/auth*`
- `/intro`
- the main-side bridge into `/villagesML`

This baseline does not attempt to fully specify internal VillagesML workspace behavior under `project/src/VillagesML`.

## Current Placeholder Policy

For the main app, `dialect clustering` is the only route currently captured as a route-level placeholder in this baseline.
Its spec documents the existing placeholder route and explicitly notes that no production clustering workflow has been implemented yet.
