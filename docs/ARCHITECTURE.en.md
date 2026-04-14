# Architecture Guide

> Current frontend architecture, entry model, and shared-layer overview for Chinese Dialect Atlas

**Documentation Language:** English | [中文](./ARCHITECTURE.md)

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Current Codebase Map](#current-codebase-map)
3. [Multi-Entry Build Model](#multi-entry-build-model)
4. [Main Site and VillagesML Sub-Application](#main-site-and-villagesml-sub-application)
5. [Routing and Compatibility Layers](#routing-and-compatibility-layers)
6. [Component and Module Layering](#component-and-module-layering)
7. [State Management](#state-management)
8. [API Architecture](#api-architecture)
9. [Layouts and Style Layers](#layouts-and-style-layers)
10. [Build and Runtime Notes](#build-and-runtime-notes)

---

## System Overview

As of 2026-04, three facts matter most when reading the frontend:

1. The real frontend project lives under `project/`; the repository root mainly holds documentation and collaboration material.
2. The frontend is no longer a single Vue app. It is a hybrid of the `main` site, the `VillagesML` sub-application, and a shared infrastructure layer.
3. Path routes are the current primary page identity. Query-style URLs such as `/menu?tab=...` and `/explore?page=...` are mainly preserved for legacy compatibility.

### Architecture Principles

- **Multi-entry build**: separate HTML inputs for distinct entry roots and better chunking.
- **Main-site / sub-app split**: the main site owns shared navigation shells and most tool pages; VillagesML owns its own entry, router, and workspace.
- **Shared infrastructure**: `api`, `i18n`, `layouts`, `styles`, `components`, and `utils` are reused across entries.
- **Compatibility layers**: legacy query routes still exist, but entry pages translate them into path-based routes.
- **Lightweight reactive state**: the project still relies on Vue `ref` / `reactive` stores instead of Vuex or Pinia.

### Technology Stack

**Frontend**
- Vue 3.5
- Vite 7
- Vue Router 4

**Visualization**
- MapLibre GL
- ECharts
- wavesurfer.js

**Shared platform layers**
- `src/api/auth`: auth, session restore, token handling
- `src/i18n`: Simplified Chinese, Traditional Chinese, and English
- `src/styles`: global, main-site, and VillagesML style entry layers

---

## Current Codebase Map

The current top-level structure that matters most is:

```text
project/
├── index.html
├── auth/index.html
├── menu/index.html
├── intro/index.html
├── explore/index.html
├── villagesML/index.html
├── vite.config.js
└── src/
    ├── main/
    ├── VillagesML/
    ├── api/
    ├── components/
    ├── i18n/
    ├── layouts/
    ├── styles/
    └── utils/
```

### Main-Site Key Directories

```text
project/src/main/
├── main.js
├── App.vue
├── router.js
├── router/
│   ├── menuRoutes.js
│   ├── exploreRoutes.js
│   └── legacyRouteMap.js
├── views/
│   ├── entry/
│   ├── menu/
│   ├── explore/
│   └── intro/
├── components/
└── store/
```

### VillagesML Key Directories

```text
project/src/VillagesML/
├── app/
│   ├── main.js
│   ├── App.vue
│   ├── router.js
│   ├── Entry.vue
│   └── ExternalRouteBridge.vue
├── dashboard/
├── workspace/
│   ├── VillagesMLWorkspace.vue
│   └── modules/
├── store/
├── config/
└── components/
```

---

## Multi-Entry Build Model

### Current Vite Inputs

`project/vite.config.js` currently defines 6 HTML build inputs:

```javascript
build: {
  rollupOptions: {
    input: {
      main: path.resolve(__dirname, 'index.html'),
      auth: path.resolve(__dirname, 'auth/index.html'),
      menu: path.resolve(__dirname, 'menu/index.html'),
      intro: path.resolve(__dirname, 'intro/index.html'),
      explore: path.resolve(__dirname, 'explore/index.html'),
      villagesML: path.resolve(__dirname, 'villagesML/index.html'),
    }
  }
}
```

### Entry Semantics

| Route Root | HTML Entry | Role |
| --- | --- | --- |
| `/` | `project/index.html` | main-site root |
| `/auth` | `project/auth/index.html` | authentication pages |
| `/menu` | `project/menu/index.html` | main-site core pages |
| `/intro` | `project/intro/index.html` | intro / support pages |
| `/explore` | `project/explore/index.html` | Explore tools and gateway pages |
| `/villagesML` | `project/villagesML/index.html` | VillagesML sub-application |

### Dev-Time MPA Rewriting

The `dev-mpa-rewrite` plugin in `vite.config.js` rewrites HTML requests for `/menu/*`, `/explore/*`, `/villagesML/*`, and the other entry roots to the correct `index.html` file during development.
This is what makes direct sub-path access work in the local dev server.

### Chunking Strategy

The build currently creates explicit chunks for:

- `i18n`
- `echarts`
- `maplibre`
- `xlsx`
- `wavesurfer`
- `logs`
- `vue-vendor`
- other third-party `vendor` code

That reflects an ongoing architectural goal: large visualization and tooling dependencies should stay as on-demand as possible across entries.

---

## Main Site and VillagesML Sub-Application

### Main Site

The main site boots from:

- `project/src/main/main.js`
- `project/src/main/App.vue`
- `project/src/main/router.js`

At startup, the main site:

- loads `main-entry.scss`
- mounts the shared message system
- initializes i18n
- runs `bootstrapAuthSession()`
- chooses `MenuLayout`, `ExploreLayout`, `IntroLayout`, or `SimpleLayout` based on the current path

The main site owns:

- `/menu/*` query, compare, phonology, result, map, and portal flows
- `/explore/*` tool pages, data pages, and the VillagesML gateway page
- `/auth/*` and `/intro/*`
- global toast / confirm / rate-limit UI

### VillagesML

VillagesML boots from:

- `project/src/VillagesML/app/main.js`
- `project/src/VillagesML/app/App.vue`
- `project/src/VillagesML/app/router.js`
- `project/src/VillagesML/app/Entry.vue`

At startup, VillagesML:

- loads `villagesml-entry.scss`
- reuses the shared message system and i18n
- owns `/villagesML/*` through its own router
- mounts `VillagesMLWorkspace.vue` in `Entry.vue`

VillagesML is internally split into:

- `dashboard/`: the dashboard shell lazily loaded by the main-site Explore gateway
- `workspace/`: the actual analysis workspace, split into `modules/*`

### Why This Hybrid Model Exists

This arrangement preserves two useful properties at once:

- the main site can offer a unified Explore shell and discovery path
- VillagesML can still evolve as a standalone sub-application with its own canonical route space and workspace organization

---

## Routing and Compatibility Layers

### Current Canonical Paths

The main site and VillagesML now primarily use path-based routing:

- `/menu/query/:sub`
- `/menu/compare/:sub`
- `/menu/map/:sub`
- `/menu/pho/:section`
- `/explore/tools/check`
- `/explore/tools/jyut2ipa`
- `/explore/tools/merge`
- `/explore/tools/praat`
- `/explore/manage`
- `/explore/yubao`
- `/explore/char-class`
- `/explore/villages/ml`
- `/villagesML/*`

### Legacy Query Entry Still Exists

The main site keeps two entry translators:

- `project/src/main/views/entry/MenuEntry.vue`
- `project/src/main/views/entry/ExploreEntry.vue`

Together with `project/src/main/router/legacyRouteMap.js`, they translate:

- `/menu?tab=...&sub=...` into `/menu/...`
- `/explore?page=...` into `/explore/...`

So query-style routing should be understood as:

- not the current primary page organization
- but still part of the compatibility surface for old links and bookmarks

### The Role of the VillagesML Bridge

In the main router, the following route exists:

```javascript
{
  path: '/villagesML/:pathMatch(.*)*',
  component: VillagesMLBridge
}
```

Its component, `project/src/main/views/entry/ExternalRouteBridge.vue`, runs:

```javascript
window.location.replace(route.fullPath)
```

The bridge does not host VillagesML business UI. Its purpose is to hand the browser off to the `villagesML/index.html` entry so the VillagesML sub-app can own that path.

Conversely, `project/src/VillagesML/app/router.js` also keeps a fallback bridge:

- `/villagesML/*` stays inside VillagesML
- unmatched paths are handed back through `ExternalRouteBridge.vue`

That means the current bridge design should be read as:

- **the canonical path remains independent**
- **the bridge is part of the current multi-entry deployment and handoff model**
- **the bridge is not the final owner of the VillagesML UI**

### Query Allowlist and Guards

`project/src/main/router.js` also contains two important runtime mechanisms:

- `ROUTE_QUERY_ALLOWLIST`: filters unsupported query keys by route
- `router.beforeEach()`: sanitizes queries, updates the document title, and performs auth checks for selected routes

At the moment, `/auth/data` and `/auth/regions` wait for `waitForAuthReady()` before deciding whether the user can proceed.

---

## Component and Module Layering

### Shared UI Layer

Cross-app shared components currently live in:

```text
project/src/components/
├── ToastAndHelp/
├── bar/
├── common/
└── selector/
```

This layer currently includes:

- global messaging and notices
- navigation bars such as `CommonBar`, `ExploreBar`, and `NavBar`
- containers such as `AppModal` and `TabsContainer`
- commonly reused selectors and dropdown components

### Main-Site View Layering

Main-site pages are mainly organized under:

- `project/src/main/views/menu/`
- `project/src/main/views/explore/`
- `project/src/main/views/intro/`
- `project/src/main/views/entry/`

Within that structure:

- `menuRoutes.js` owns `/menu/*`
- `exploreRoutes.js` owns `/explore/*`
- `views/entry/*` mainly handles legacy entry translation and bridge behavior

### VillagesML Workspace Layering

VillagesML workspace features are split into:

```text
project/src/VillagesML/workspace/modules/
├── character/
├── ml/
├── pattern/
├── regional/
├── search/
├── semantic/
├── spatial/
├── system/
└── village/
```

This is an important architectural signal: VillagesML is no longer just a dashboard page. It is a real sub-application with its own workspace module hierarchy.

---

## State Management

### Main-Site State

Main-site state currently lives mainly in:

- `project/src/main/store/store.js`
- `project/src/main/store/customRegionStore.js`
- `project/src/main/store/userStats.js`

`store.js` still uses Vue-native `ref` / `reactive` state objects, with core stores such as:

- `globalPayload`
- `userStore`
- `mapStore`
- `queryStore`
- `resultCache`
- `uiStore`

This keeps the project's long-standing pattern of using lightweight domain stores without Vuex or Pinia.

### VillagesML State

VillagesML currently uses:

- `project/src/VillagesML/store/villagesMLStore.js`

That store centralizes:

- active tab state
- village search filters and results
- regional analysis data
- clustering settings and results
- semantic-network settings
- workspace-level loading and error state

So the current state model is not a single monolithic global store. It is a parallel set of domain stores for the main site and VillagesML.

---

## API Architecture

### Shared API Root

APIs are currently organized under:

```text
project/src/api/
├── auth/
├── logs/
├── main/
│   ├── core/
│   ├── geo/
│   ├── sql/
│   ├── tools/
│   └── user/
├── villagesML/
└── index.js
```

### Main Layers

- `src/api/auth/`: auth, session, token storage, HTTP client, validation
- `src/api/main/`: main-site business APIs
  - `core/`: query, compare, phonology
  - `geo/`: locations and geographic data
  - `sql/`: database query and mutation helpers
  - `tools/`: Praat, check, merge, jyut2ipa
  - `user/`: custom data and custom region APIs
- `src/api/villagesML/`: VillagesML-specific analysis APIs
- `src/api/logs/`: visit and logging-related APIs

### Central Export Layer

`project/src/api/index.js` still provides a central export surface:

- convenient for main-site pages that want a single import entry
- also already re-exporting a large number of VillagesML APIs

In other words, the current codebase uses:

- **namespaced directories at the lower layer**
- **aggregated exports where the upper layer benefits from them**

That is also the current architectural precedent for future standalone modules.

---

## Layouts and Style Layers

### Shared Layout Shells

Layout shells live in:

```text
project/src/layouts/
├── ExploreLayout.vue
├── IntroLayout.vue
├── MenuLayout.vue
└── SimpleLayout.vue
```

The main site's `App.vue` decides which layout to use based on the route:

- `/` and `/villagesML/*`: `SimpleLayout`
- `/intro*`: `IntroLayout`
- typical `/explore/*`: `ExploreLayout`
- other main-site pages: `MenuLayout`

So layout selection is centralized in the app shell rather than delegated to each page independently.

### Style Entry Layers

Styles are currently split into three entry layers:

```text
project/src/styles/
├── global-entry.scss
├── main-entry.scss
├── villagesml-entry.scss
├── global/
├── main/
└── villagesml/
```

Their roles are:

- `global/`: shared tokens, base rules, glass, scrollbars, utilities
- `main/`: main-site forms, toolbars, overlays, surfaces
- `villagesml/`: VillagesML workspace and panel styling

This matches the runtime architecture: shared foundations exist, but the main site and VillagesML already have their own style sub-layers.

---

## Build and Runtime Notes

### Router Mode

Both the main site and VillagesML currently use `createWebHistory()`.
That means the old hash-router mental model should no longer be treated as current architecture.

In practice:

- deployment needs to consider path routing together with multi-entry HTML
- documentation and collaboration guidance should describe canonical path routes first

### Lazy Loading

Lazy loading is used heavily in:

- `menuRoutes.js` and `exploreRoutes.js`
- the VillagesML dashboard gateway
- VillagesML workspace panels and feature modules

This remains one of the main strategies for controlling initial bundle size and analysis-page cost.

### Shared Infrastructure Is Still Shared

Even though `main` and `VillagesML` are now distinct applications, they still share important infrastructure:

- `src/api/auth`
- `src/i18n`
- `src/components/ToastAndHelp`
- `src/layouts`
- `src/utils/message.js`

### The Single Most Important Takeaway

If you only remember one thing, remember this:

- `main` and `VillagesML` are now two clearly separated Vue application entries
- they still share a substantial infrastructure layer
- bridge pages and legacy route maps are part of the deployment and compatibility model, not proof that the apps lack independent route identity

---

**Further reading:**

- [Documentation Center](./README.en.md)
- [Contributing Guide](./CONTRIBUTING.en.md)
- [API Reference](./API.en.md)
- [VillagesML Feature Overview](./VillagesML/FEATURE_OVERVIEW.md)
