# Main State Boundary Audit

This document only audits the current `main` application state boundaries. It does not propose behavior changes for `VillagesML`.

## 1. Current State Layers

### A. URL state

Current owner:

- `src/main/router.js`
- `src/main/router/menuRoutes.js`
- `src/main/router/exploreRoutes.js`
- `src/main/router/legacyRouteMap.js`
- `src/composables/router/useRouteQueryState.js`

Current use cases:

- top-level page identity is now mainly path-based
- tab and view variants are carried by query when they are true internal state
- legacy `/menu?tab=...` and `/explore?page=...` are redirected into canonical routes
- route query is sanitized globally in `router.beforeEach`

Assessment:

- This layer is materially better than before. The routing model is now understandable.
- Query ownership is still partly distributed between route guards and page-level composables.
- The allowlist in `router.js` is now the single compatibility gate, but it is also becoming a large policy bucket.

### B. Cross-page domain state

Current owner:

- `src/main/store/store.js`
- `src/main/store/customRegionStore.js`

Current buckets:

- `userStore`: auth session and current user
- `mapStore`: map mode, merged result data, selected feature, compare metadata
- `queryStore`: shared locations, regions, region mode
- `resultCache`: latest results and feature cache
- `uiStore`: button disabled state and current tab bookkeeping
- `globalPayload`: transient query payload bridge
- `customRegionStore`: custom region cache with memory + `localStorage`

Assessment:

- `userStore` is a valid app-level singleton. It represents real cross-page session state.
- `customRegionStore` is also a valid singleton-style domain cache, but its persistence logic is handwritten and separate from the generic storage composable.
- `mapStore`, `queryStore`, `resultCache`, `uiStore`, and `globalPayload` are mixed bags. Each contains both true shared state and page-flow state.
- The main architectural weakness is not "too little state management". It is that multiple state lifetimes are stored in the same global module.

### C. Page-local derived state

Current owner:

- page SFCs
- extracted composables already introduced in previous refactors

Representative examples:

- `src/main/views/menu/MapPage.vue`
- `src/main/views/Praat.vue`
- `src/main/views/explore/word/YuBaoPage.vue`
- `src/main/components/pho/PhonologyPage.vue`
- `src/main/components/pho/PhonologyCustom.vue`

Assessment:

- This layer is now healthier than the old global-only model.
- Some pages already keep internal tab state in URL via `useRouteQueryState`, which is the correct boundary for refresh/share/back-forward behavior.
- The remaining issue is inconsistency: some similar concerns still live in global stores while others already moved to local refs/composables.

### D. Persistence state

Current owner:

- `src/composables/core/useStorageState.js`
- `src/composables/domain/geo/usePartitionCache.js`
- `src/main/store/customRegionStore.js`
- direct `localStorage` / `sessionStorage` reads in feature pages

Current examples:

- Praat settings already use `useStorageState`
- partition cache uses dedicated session storage helper
- custom region cache uses handwritten `localStorage`
- `YuBaoPage.vue`, `TableManage.vue`, `PitchTonePanel.vue`, `Jyut2IpaTool.vue`, and menu config utilities still manage storage inline

Assessment:

- Persistence strategy is the most fragmented part of `main`.
- The project already has the right primitive in `useStorageState`, but adoption is partial.
- This is a stronger reason to continue extracting composables than introducing Pinia immediately.

## 2. Boundary Problems That Still Exist

### A. Global store mixes multiple lifetimes

`store.js` currently combines:

- session-level auth state
- page-to-page workflow state
- result cache
- UI disable flags
- tab bookkeeping

These do not have the same lifecycle:

- auth state should live for the full app session
- result cache should survive route transitions only when the feature flow requires it
- button disabled state should usually die with the page instance
- tab bookkeeping should often be URL-driven instead of singleton-driven

This is the clearest reason the state layer still feels heavy.

### B. `uiStore` contains state that should not be globally authoritative

`uiStore.buttonStates` and part of `uiStore.currentSubTab` are not true app-wide state. They are mostly:

- validation state
- running state
- page interaction state

Those values are coupled to specific views such as query, compare, and map. Keeping them in a singleton raises two risks:

- stale state leaks when entering another page
- behavior becomes harder to reason about because ownership is invisible from the page itself

### C. `globalPayload` is still an escape hatch

`globalPayload` is convenient, but architecturally weak:

- it bypasses route contracts
- it bypasses explicit store module ownership
- it makes navigation flow depend on write order between pages

If kept long term, it should at least be treated as a narrowly scoped workflow bridge, not a general transport layer.

### D. Persistence conventions are not unified

There are currently three patterns:

- generic composable persistence
- custom cache modules
- direct inline storage access

This increases maintenance cost because expiration, reset, serialization, and corruption handling are repeated inconsistently.

## 3. What Is Already Good Enough

These parts do not need urgent replacement:

- path-based canonical routes for `main`
- `useRouteQueryState` as the default query-sync primitive
- router-level query sanitization
- `userStore` as current auth/session singleton
- `customRegionStore` as a temporary shared cache owner

Replacing these immediately with Pinia would not create enough value relative to current cost.

## 4. Recommended State Taxonomy For Main

Use this rule set going forward.

### A. Put it in route state when all are true

- the user should be able to refresh and keep it
- the user should be able to share the URL
- browser back/forward should restore it
- the value is part of view identity or visible filtering

Examples:

- active tab
- selected feature id
- location filter text when it defines the current result view
- open panel id when deep-linking is useful

### B. Put it in page-local composables when all are true

- only one page subtree uses it
- it should reset when leaving the page
- it mainly coordinates UI behavior or async lifecycle

Examples:

- button disabled state
- loading state for one page
- temporary validation state
- modal open/close state

### C. Put it in shared singleton state only when all are true

- multiple routes need the same value
- the value should outlive one page instance
- passing it via props/route would be worse than central ownership

Examples:

- authenticated user and auth readiness
- custom region cache
- cross-page result handoff that is intentionally session-scoped

### D. Put it in persistence helpers when all are true

- it is user preference, cache, or resumable draft
- it must survive reload
- storage behavior should be explicit and testable

Examples:

- Praat settings
- cached custom regions
- tool-specific draft config

## 5. Concrete Next Refactor Order

This is the recommended order for future `main` work.

### Priority A

Move page-interaction state out of `uiStore` where it is only used by one page flow:

- query button running / disabled coordination
- compare button running / disabled coordination
- map custom/divide transient UI flags

Target form:

- page composable per flow
- route state only for shareable tab identity

### Priority B

Replace handwritten persistence with shared composables where behavior is standard:

- `customRegionStore` can eventually reuse `useStorageState` internally
- `YuBaoPage.vue` cache reads/writes can be extracted
- tool pages with direct `localStorage` can be normalized case by case

### Priority C

Constrain `globalPayload` to an explicit result-navigation workflow or phase it out where route/store contracts are enough.

## 6. Pinia Decision From This Audit

Pinia is not the first missing piece here.

What is missing first:

- cleaner ownership by state lifetime
- fewer singleton escape hatches
- consistent persistence helpers

Pinia becomes useful after that cleanup if you want:

- devtools-level store inspection
- explicit store modules per domain
- easier multi-developer ownership boundaries

If introduced today without boundary cleanup, Pinia would mostly wrap the current mixed lifetimes in a nicer API, but it would not solve the underlying ownership problem.
