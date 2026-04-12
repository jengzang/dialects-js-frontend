# Main Routing Compatibility Audit

This document audits the current compatibility chain for the `main` application only.

## 1. Current Compatibility Layers

The current routing compatibility chain is split across four places:

- `src/main/router.js`
- `src/main/router/legacyRouteMap.js`
- `src/main/views/entry/MenuEntry.vue`
- `src/main/views/entry/ExploreEntry.vue`
- `src/main/App.vue`

That split is acceptable today because each layer does a different job.

## 2. What Each Layer Actually Owns

### A. `router.js`

Owns:

- canonical route table
- fallback redirects such as `/menu/query -> /menu/query/zhonggu`
- query allowlist sanitization
- auth gate for protected routes

It should remain the canonical routing source.

### B. `legacyRouteMap.js`

Owns:

- pure mapping from legacy query contracts to canonical paths
- legacy `/menu?tab=...&sub=...`
- legacy `/explore?page=...&sub=...`
- special VillagesML compatibility branch

This file is correctly isolated. It is the cleanest part of the compatibility layer because it is pure and testable.

### C. `MenuEntry.vue` and `ExploreEntry.vue`

Own:

- translating a request that still arrives at `/menu` or `/explore`
- immediate redirect into canonical paths

These entry components are currently necessary because:

- old links may still hit `/menu` and `/explore`
- the home page and config now mostly use canonical paths, but external bookmarks are still unknown
- router-level route definitions alone do not translate the old query contracts

### D. `App.vue`

Owns:

- choosing the outer layout shell before the route component tree finishes redirecting

This is the critical nuance.

`App.vue` is not only rendering shells for canonical routes. It is also compensating for transitional routes during the first render frame.

## 3. Is The Legacy `App.vue` Logic Still Necessary

### A. `/explore` branch

Current logic:

- when `route.path === '/explore'`
- read `route.query.page`
- choose `SimpleLayout` for legacy Praat entry
- choose `ExploreLayout` for other legacy explore entries

Assessment:

- This branch is still necessary today.
- Reason: `ExploreEntry.vue` performs the compatibility redirect reactively after the route is already active.
- That means `App.vue` may render once while the URL is still the legacy `/explore?...` form.
- If this branch is removed now, legacy Praat entry could render with the wrong shell before redirect settles.

Conclusion:

- keep this branch for now
- do not treat it as dead code yet

### B. `/villagesML` branch

Current logic:

- when route is `/villagesML` or starts with `/villagesML/`
- force `SimpleLayout`

Assessment:

- This branch is still necessary as long as `/villagesML/:pathMatch(.*)*` remains a supported compatibility bridge in `router.js`
- `legacyRouteMap.js` still intentionally redirects some VillagesML legacy states to `/villagesML`

Conclusion:

- keep this branch for now

### C. `/intro` branch

Current logic:

- `route.path.startsWith('/intro')` uses `IntroLayout`

Assessment:

- This is not legacy compatibility logic
- this is current route ownership

Conclusion:

- definitely keep

## 4. What Is Safe To Consider Canonical Now

These paths already look like the real route model for `main`:

- `/menu/query/:sub`
- `/menu/compare/:sub`
- `/menu/map/:sub`
- `/menu/pho/:section`
- `/menu/about/:section`
- `/explore/tools/*`
- `/explore/manage`
- `/explore/yubao`
- `/explore/char-class`
- `/explore/yc-spoken`
- `/explore/villages/*`

Evidence:

- router definitions already center on these paths
- sidebar and home-page navigation already mostly point to these paths
- tests now cover both legacy mapping and entry redirect behavior

## 5. What Is Still Legacy Compatibility Surface

These are still compatibility-facing entry points:

- `/menu` with `tab` and `sub`
- `/explore` with `page` and `sub`
- `/villagesML` legacy module entry
- `App.vue` transitional shell choice for `/explore` and `/villagesML`

These are not identical in risk:

- `legacyRouteMap.js` and entry components are explicit compatibility infrastructure
- `App.vue` is implicit compatibility infrastructure

The implicit part is why this audit matters.

## 6. Recommended Policy

### Keep now

Keep these without cleanup in the current stage:

- `legacyRouteMap.js`
- `MenuEntry.vue`
- `ExploreEntry.vue`
- `App.vue` branches for `/explore` and `/villagesML`

Reason:

- removing them now creates compatibility risk without enough payoff
- the current cost is small and now protected by regression tests

### Tighten later

The right future cleanup order is:

1. measure whether legacy `/menu`, `/explore`, and `/villagesML` traffic still matters
2. if legacy traffic is negligible, remove the legacy entries first
3. only after that, remove the corresponding transitional layout branches from `App.vue`

This order matters. Removing `App.vue` compatibility first is the wrong direction.

## 7. Final Judgment

The current compatibility structure is acceptable but intentionally transitional.

What is good:

- canonical routes are already separated from legacy mapping
- legacy mapping is now pure and testable
- redirect entry points are explicit

What still deserves caution:

- `App.vue` still contains compatibility-sensitive shell logic
- the reason is valid today, but it should be documented because otherwise it looks like random historical branching

Practical conclusion:

- do not clean `App.vue` compatibility branches yet
- treat them as guarded transitional code
- if future cleanup starts, remove legacy entry routes first, then remove `App.vue` transitional layout handling
