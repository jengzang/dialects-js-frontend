# Design: Main App OpenSpec Baseline

## Design Goal

Create a maintainable OpenSpec baseline for the current main app without mixing current behavior and future aspirations.

## Structure Choice

The baseline uses the standard OpenSpec layout:

```text
openspec/
├── project.md
├── specs/
└── changes/
```

Within `openspec/specs/`, the baseline uses a hybrid organization:

- shared platform capabilities get their own specs
- major user-facing workflow areas get their own specs

This avoids two bad extremes:

- route-by-route duplication
- purely abstract domain specs that are hard to map back to the current router

## Main App Spec Split

The baseline is split into these specs:

- `app-shell-and-navigation`
- `auth-and-user-workspace`
- `location-and-region-selection`
- `query-workflows`
- `compare-workflows`
- `result-presentation`
- `map-visualization`
- `phonology-analysis`
- `char-class-exploration`
- `lexical-and-grammar-resources`
- `villages-exploration`
- `data-tools`
- `praat-audio-analysis`
- `support-and-about-pages`
- `dialect-clustering`

## Current-State Policy

The baseline follows current code rather than historical assumptions.

- If the route exists and the UI is implemented, the source spec records current delivered behavior.
- If the route exists but the feature is still a placeholder, the source spec records the placeholder state.
- If the main app bridges into another runtime, the source spec records the bridge behavior but does not claim ownership of the downstream runtime.

## Project-Level Rules Captured In `project.md`

`project.md` pulls forward the repo conventions that matter for future OpenSpec changes:

- minimal change scope
- path-first routing
- compatibility bridges where they currently exist
- i18n completeness across three locales
- Chinese and emoji text integrity
- respect for the current directory layout
- current-code-first specification discipline

## Why Main-App-First

The repository contains both the main site and the VillagesML runtime, but they have different scope and complexity profiles.
The current baseline intentionally prioritizes the main site because:

- it is the user's requested scope
- it contains the most cross-cutting current workflows
- it is the area most affected by current repo-level change-control rules
- it can be specified without pretending to fully capture VillagesML internals
