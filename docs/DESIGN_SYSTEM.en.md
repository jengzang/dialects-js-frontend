# Design System

> A codebase-aligned guide to style entry points, shared components, and reuse rules

**Language:** English | [中文](./DESIGN_SYSTEM.md)

---

## What This Document Is For

This is not a detached brand manual. It is a collaboration-facing implementation guide for the current repository.

It answers questions such as:

- Where global styles enter the app
- Which style layers belong to the main site versus `VillagesML`
- Which shared components should be reused first
- Where new pages or sub-apps should place their styles, and when they should avoid touching shared layers

If you are trying to decide whether a new page should use `CommonBar`, `TabsContainer`, or `AppModal`, or where its styles should live, start here.

---

## Current Style Entry Points

The project no longer relies on a single `src/style.css`. Styles are now split into dedicated entry layers for global foundations, the main site, and `VillagesML`.

### Entry files

```text
project/src/styles/
├── global-entry.scss
├── main-entry.scss
├── villagesml-entry.scss
├── _legacy.scss
├── global/
├── main/
└── villagesml/
```

### Responsibilities of the three entries

- `global-entry.scss`
  - shared baseline entry for all apps
  - loads global tokens, base, scrollbars, loading, glass, and utility layers
- `main-entry.scss`
  - main-site entry
  - extends the global layer with buttons, forms, surfaces, toolbars, overlays, popups, and states
- `villagesml-entry.scss`
  - `VillagesML` entry
  - extends the global layer with `VillagesML` surfaces, panels, controls, and workspace styling

### About `_legacy.scss`

Token migration is still in progress. `project/src/styles/global/_tokens.scss` exists as the long-term token home, but actual tokens still largely flow from `project/src/styles/_legacy.scss` to preserve current visuals.

That means:

- do not casually rename or delete existing legacy tokens
- do not assume the entire styling system has already been migrated
- when adding a page, prefer reusing existing variables and structure instead of turning the task into a full token refactor

---

## Style Layer Rules

### `global/`

`project/src/styles/global/` is for foundations that every app can share. It currently includes:

- `_base.scss`
- `_close-buttons.scss`
- `_glass.scss`
- `_loading.scss`
- `_scrollbars.scss`
- `_tokens.scss`
- `_utilities.scss`

This layer is appropriate for:

- reset and base rules
- utility classes
- common scrollbars, close buttons, and loading treatments
- visual foundations that do not depend on one specific page domain

### `main/`

`project/src/styles/main/` serves the main site. It is the right place for:

- main-site form treatments
- toolbars
- overlays and popups
- main-site-specific surface and state styling

### `villagesml/`

`project/src/styles/villagesml/` is reserved for the `VillagesML` workspace. It is the right place for:

- analysis panels
- workspace layout rules
- module control areas
- `VillagesML`-specific surfaces

---

## Style Strategy for New Pages and Sub-Apps

### 1. Keep styles inside the module first

If you are adding a standalone page or sub-app such as `PhoneticToolbox`, its styles should live inside its own workspace by default instead of immediately being pushed into shared layers.

Recommended approach:

- page-private styles stay in `src/<ModuleName>/...`
- only extract to shared layers after a pattern is clearly reused in multiple places
- before promoting anything to a shared layer, confirm that it is truly cross-module and not just a one-off page treatment

### 2. Avoid changing shared component styles casually

This repository already has mature visual patterns for the main site and `VillagesML`. Unless the task is explicitly about extending a shared capability, new module work should avoid modifying:

- `project/src/components/`
- `project/src/styles/global/`
- `project/src/styles/main/`
- `project/src/styles/villagesml/`

This is especially important when the user has explicitly asked collaborators to stay inside their own workspace only.

### 3. Plug into existing style layers instead of inventing a parallel system

The project already provides:

- a global style entry
- a main-site style entry
- a `VillagesML` style entry
- reusable shared components and interaction patterns

New work should attach to these existing foundations instead of creating another global styling mechanism.

---

## Shared Component Inventory and Recommended Reuse Order

The most reusable shared components currently live under `project/src/components/`.

### Navigation and top bars

#### `project/src/components/bar/CommonBar.vue`

Use it when:

- a new standalone module has multiple top-level tabs
- you need a configurable top bar schema
- desktop and mobile navigation should share one component

This is the preferred top-bar component for new sub-apps. Your existing collaboration rule that strongly recommends `CommonBar` for multi-tab modules is a good rule and should remain explicit.

#### `project/src/components/bar/ExploreBar.vue`

Use it when:

- the page belongs to the main-site `explore` system

This component is tightly coupled to the main `Explore` navigation config and remembered child-route logic. It is not the generic template for a new standalone module. For new sub-apps, start with `CommonBar`, not `ExploreBar`.

#### Other bar components

- `NavBar.vue`
- `SimpleSidebar.vue`
- `IntroTabBar.vue`
- `FloatingButtons.vue`

These can still be reused when appropriate, but `CommonBar` remains the first option for new module-level navigation.

### Local tabs and tab containers

#### `project/src/components/common/TabsContainer.vue`

Use it when:

- you need local in-page tab switching
- you want simple `v-model` or route synchronization
- you do not want to build another tabs shell from scratch

If the requirement is an in-page section switch rather than module-level top navigation, this should usually be considered first.

### Modals

#### `project/src/components/common/AppModal.vue`

Use it when:

- you are adding a modal or dialog
- you need a fixed header with independently scrollable content
- you want Teleport, a glass panel treatment, and consistent close-button behavior

This component also aligns with one of the repository's important UI safety rules: modal headers should not scroll away with the body content.

### Selectors

Reusable selection components currently include:

- `project/src/components/selector/ChoiceSelector.vue`
- `project/src/components/selector/MultiSelectDropdown.vue`
- `project/src/components/selector/SimpleDropdown.vue`
- `project/src/components/selector/SimpleSelectDropdown.vue`

Use them for:

- standard single-select and multi-select interactions
- searchable dropdowns
- forms that should remain visually aligned with the rest of the project

If the task is just “pick from a list,” do not reach for a new dropdown first.

### Feedback and help

Reusable feedback helpers currently include:

- `project/src/components/ToastAndHelp/GlobalToast.vue`
- `project/src/components/ToastAndHelp/GlobalConfirm.vue`
- `project/src/components/ToastAndHelp/HelpIcon.vue`
- `project/src/components/ToastAndHelp/RateLimitNotice.vue`
- `project/src/components/ToastAndHelp/UpdateNoticeModal.vue`

These already cover global toast feedback, confirmation dialogs, inline help, and rate-limit notices.

---

## Routing, Page Identity, and Layout Conventions

These are not purely visual, but they strongly affect page structure and UI implementation, so they belong here too.

### Use paths, not query params, for top-level page identity

Top-level page identity should be expressed by path routes. Query parameters should usually represent internal page state rather than “which page am I on.”

### Modal headers should remain fixed

This is a high-priority repository rule. New modal implementations should preserve:

- a fixed header
- a separately scrollable content area
- consistent close-button placement

### New entry pages should connect to the existing navigation model

If you are building a new standalone sub-app, also think about:

- whether it needs an entry inside the `Explore` area
- whether the main site should expose a dedicated gateway page into it
- whether a bridge layer is needed between the main site and the sub-app

As already clarified elsewhere in the docs, routes such as `/villagesML/:pathMatch(.*)*` are intentional standalone paths. The bridge is a wiring layer, not the page identity itself.

---

## Naming and Technical Style

### New module names should use PascalCase

For new standalone modules or sub-apps, prefer PascalCase names such as:

- `PhoneticToolbox`
- `VillagesML`

This keeps directories, app entry files, and API namespaces more consistent.

### Composition API + SCSS is the recommended pairing

The overall repository is still JS-first, but new pages and new modules fit the existing stack best when they use:

- Vue Composition API
- SCSS

### Guidance on TypeScript

Because the current repository is still primarily JavaScript-based, TypeScript should only be introduced carefully:

- keep the scope isolated to the new module when possible
- avoid forcing TS expectations onto the shared layer or mature main-site code without explicit alignment

In other words, bounded TypeScript can be discussed; quietly pushing the shared surface toward TS is not a good default.

---

## Practical Recommendations for Collaborators

When a collaborator is adding a new standalone page or sub-app, the recommended order is:

1. Check whether a shared component already covers the need
2. For multi-tab top navigation, look at `CommonBar` first
3. For local tabs, look at `TabsContainer` first
4. For dialogs, look at `AppModal` first
5. For selectors, look under `selector/` first
6. For global notices and feedback, look under `ToastAndHelp/` first
7. Keep styles inside the module workspace first
8. Only extract to shared layers after the reuse is stable and clearly cross-module

This keeps the main site, `VillagesML`, and other existing projects from being disturbed by one module’s implementation details.

---

## Related Documentation

- Overall structure and entry relationships: [ARCHITECTURE.md](./ARCHITECTURE.md)
- API organization: [API.md](./API.md)
- Collaboration boundaries for new modules: [CONTRIBUTING.md](./CONTRIBUTING.md)

If you are adding a module such as `PhoneticToolbox`, this document should be read together with `CONTRIBUTING.md`: this file covers style and component reuse, while `CONTRIBUTING.md` covers directories, routing, API placement, and collaboration boundaries.
