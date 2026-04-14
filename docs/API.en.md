# API Documentation

> Collaboration-facing API documentation aligned with the current frontend codebase

**Language:** English | [中文](./API.md)

---

## Scope

This document describes the actual API organization inside `project/src/api` in the frontend repository. It is not meant to be a complete backend endpoint catalog.

Use this file when you are adding frontend features, extending API modules, or building a new standalone page or sub-application inside this repo.

---

## Current Structure

Frontend API code lives under `project/src/api/` and is currently split into a shared authentication layer, the main-site business layer, a `VillagesML`-specific layer, and a small logging layer:

```text
project/src/api/
├── auth/                  # login, register, session, token, HTTP client
├── main/
│   ├── core/              # core search and phonology analysis
│   ├── geo/               # locations, regions, coordinates
│   ├── sql/               # SQL querying and mutations
│   ├── tools/             # merge / check / jyut2ipa / praat
│   └── user/              # user custom data and custom regions
├── villagesML/            # natural-village analysis APIs
├── logs/                  # visit and usage stats
└── index.js               # global aggregated export surface
```

For most pages and components, prefer importing from `@/api` instead of reaching into deep files from view code.

```javascript
import {
  searchChars,
  getLocations,
  loginUser,
  ensureAuthenticated,
  getSpatialHotspots
} from '@/api'
```

---

## Import Strategy

### 1. Prefer the central export surface in app code

`project/src/api/index.js` is the repository-wide import surface. Main-site pages, `VillagesML` workspace modules, and future standalone modules should normally consume APIs from there.

Typical consumers:

- view pages
- business components
- composables
- workspace modules

### 2. Direct sub-entry imports are for module organization work

These sub-entries still exist and are useful when you are organizing API code itself:

- `project/src/api/auth/index.js`
- `project/src/api/main/core/index.js`
- `project/src/api/main/geo/index.js`
- `project/src/api/main/sql/index.js`
- `project/src/api/main/tools/index.js`
- `project/src/api/main/user/index.js`
- `project/src/api/villagesML/index.js`

Use them when you are developing or reorganizing API layers, or when a subsystem intentionally stays self-contained.

### 3. Do not hardcode base URLs in components

Requests are normalized through `api()` in `project/src/api/auth/httpClient.js`. That layer builds URLs from `WEB_BASE` and already handles:

- auth token injection
- token refresh
- timeout and network failures
- normalized HTTP errors
- rate-limit notices

Component code should not assemble `https://.../api/...` strings directly.

---

## Authentication Layer `auth/`

Authentication and session management live in `project/src/api/auth/`.

### Key files

- `auth.js`: session bootstrap and helper re-exports
- `actions.js`: login, register, profile updates, logout, leaderboard
- `httpClient.js`: shared request client and error normalization
- `session.js`: refresh flow, auth bootstrap, online-time reporting
- `tokenStorage.js`: token and user-cache persistence
- `validation.js`: auth form validation helpers

### Main exports

```javascript
import {
  loginUser,
  registerUser,
  logoutUser,
  updateUsername,
  updatePassword,
  getLeaderboard,
  bootstrapAuthSession,
  ensureAuthenticated,
  waitForAuthReady,
  reportOnlineTime,
  getUserRole,
  validateEmail,
  validateUsername,
  validatePassword,
  validatePasswordMatch
} from '@/api'
```

### Recommended usage

- Login, registration, and profile screens should call `loginUser`, `registerUser`, `updateUsername`, and `updatePassword` directly
- Protected features should reuse the existing auth/session flow instead of recreating local token checks
- If a new sub-app requires authentication, reuse `src/api/auth` and the existing route/page guard approach rather than building another auth client

### Example

```javascript
import { ensureAuthenticated, loginUser } from '@/api'

await ensureAuthenticated()

await loginUser({
  username: 'demo',
  password: 'secret'
})
```

---

## Main-Site Business Layer `main/`

`project/src/api/main/` powers the main site and shared query pages. It is currently split into five areas.

### `main/core/`

Core phonology, comparison, and matrix analysis APIs.

Common exports:

- `searchChars`
- `searchZhongGu`
- `searchYinWei`
- `searchTones`
- `getCharList`
- `getFeatureCounts`
- `getFeatureStats`
- `getPhonologyMatrix`
- `getPhonologyClassificationMatrix`
- `queryPhonology`
- `postPhoPieByValue`
- `postPhoPieByStatus`
- `compareChars`
- `compareZhongGu`
- `compareTones`

### `main/geo/`

Location, region, and coordinate helpers.

Common exports:

- `getLocations`
- `getLocationDetail`
- `getLocationPartitions`
- `batchMatch`
- `getPartitions`
- `getRegions`
- `getCoordinates`

### `main/sql/`

SQL querying, mutations, and tree-loading helpers.

Common exports:

- `sqlQuery`
- `distinctQuery`
- `getTableColumns`
- `queryCount`
- `mutateSingleRow`
- `batchMutate`
- `batchReplacePreview`
- `batchReplaceExecute`
- `lazyLoadTree`
- `loadFullTree`

### `main/tools/`

APIs for the main-site tools, currently split by tool:

- `merge.js`: table merge
- `check.js`: table validation/checking
- `jyut2ipa.js`: Jyutping-to-IPA conversion
- `Praat.js`: Praat acoustic analysis

Common exports:

- `uploadReference`
- `uploadFiles`
- `executeMerge`
- `getMergeProgress`
- `downloadMerge`
- `uploadCheckFile`
- `analyzeFile`
- `getToneStats`
- `getTableData`
- `updateRow`
- `batchDelete`
- `executeBatchOperation`
- `downloadCheckResult`
- `uploadJyutFile`
- `processJyut2Ipa`
- `getJyut2IpaProgress`
- `downloadJyut2IpaResult`
- `praat`
- `usePraatApi`

### `main/user/`

Main-site user-owned custom data and custom-region APIs.

This area is currently split across:

- `custom-data.js`
- `custom.js`
- `custom-regions.js`

Common exports:

- `getAllCustomData`
- `editCustomData`
- `batchCreateCustomData`
- `batchDeleteCustomData`
- `getCustomData`
- `getCustomFeature`
- `submitCustomForm`
- `deleteCustomForm`
- `getCustomRegions`
- `createOrUpdateCustomRegion`
- `deleteCustomRegion`

---

## `VillagesML` Layer

`project/src/api/villagesML/` is the dedicated API layer for the natural-village ML workspace. It is already clearly separated from the main-site API surface and should be treated as the reference pattern for future standalone analytical sub-apps.

### Current groupings

- `villages.js`: village search and single-village detail
- `characters.js`: frequency, tendency, embeddings, significance
- `clustering.js`: clustering jobs, status, cache
- `clusteringTypes.js`: algorithm-specific clustering entry points
- `semantic.js`: semantic network
- `semanticCategories.js`: semantic categories and subcategories
- `semanticLabels.js`: semantic labels and combination patterns
- `semanticComposition.js`: composition statistics and PMI
- `spatial.js`: hotspots, spatial clustering, integration
- `ngrams.js`: n-gram analysis
- `patterns.js`: structural patterns
- `regional.js`: regional aggregates and vector comparisons
- `compute.js`: feature extraction and subset comparison
- `metadata.js`: table and database metadata
- `regionSimilarity.js`: region similarity

### Common exports

```javascript
import {
  searchVillages,
  getGlobalCharFrequency,
  runClustering,
  getSemanticNetwork,
  getSpatialHotspots,
  getRegionSimilarityMatrix,
  extractFeatures,
  aggregateFeatures
} from '@/api'
```

### Why this split matters

`VillagesML` shows the preferred pattern when a sub-application has:

- a clear product boundary
- its own route space
- many dedicated analytical APIs

In that situation, APIs should live under `project/src/api/<ModuleName>/` instead of being folded back into `project/src/api/main/`.

---

## Logging and Utility Re-exports

### Logging `logs/`

Current exports:

- `getTodayVisits`
- `getTotalVisits`
- `getVisitHistory`

### URL helpers

`project/src/api/index.js` also forwards URL helpers from `project/src/utils/urlParams.js`:

- `decodeParams`
- `buildQueryUrl`
- `copyCurrentUrl`
- `getUrlSegmentValue`

These are not HTTP APIs, but they are intentionally exposed through the same import surface because multiple query/share flows reuse them.

---

## Error Handling and Request Conventions

The frontend API layer already encodes a consistent request contract. New APIs should follow it.

### Error shape

`api()` normalizes failures into `Error` objects with additional fields such as:

- `kind`
- `status`
- `data`
- `detail`
- `headers`
- `rawText`

Callers should prefer consuming this normalized error shape instead of rebuilding response parsing in view code.

### Auth refresh

The request layer proactively checks whether the token is expired or close to expiring, and refreshes when needed. Protected APIs should rely on this shared flow rather than duplicating refresh logic.

### Timeout and rate limiting

The shared client already handles:

- request timeout aborts
- JSON / text / blob response parsing
- 429 notice payload construction

New APIs should build on that client rather than using ad hoc `fetch` calls inside components.

---

## Rules for Adding New APIs

### 1. Put the API in the right layer

- Main-site shared query/tool/geo/sql/user features: `project/src/api/main/`
- Auth, token, session work: `project/src/api/auth/`
- `VillagesML`-specific functionality: `project/src/api/villagesML/`
- New standalone sub-app: `project/src/api/<ModuleName>/`

### 2. Reuse existing auth infrastructure

If a new module is login-protected, reuse:

- `project/src/api/auth/`
- the existing session/token flow
- the current route or page guard approach

Do not clone a second token storage or refresh system for one module.

### 3. Decide carefully whether to expose through `@/api`

- If the API is only temporary or module-internal, it can stay inside its own entry
- If it becomes a stable cross-page or cross-subsystem dependency, add it to `project/src/api/index.js`
- Before exporting globally, check for naming collisions

### 4. Match current naming style

API functions currently use camelCase naming, for example:

- `getSpatialHotspots`
- `getRegionSimilarityMatrix`
- `batchCompareRegionalVectors`
- `createOrUpdateCustomRegion`

New functions should follow the same style.

---

## Practical Examples

### A query page using the central export surface

```javascript
import { searchChars, getLocations } from '@/api'

const locations = await getLocations()
const rows = await searchChars({
  chars: '你好',
  locations: ['廣州'],
  regions: [],
  region_mode: 'full'
})
```

### A new sub-app reusing existing authentication

```javascript
import { ensureAuthenticated, waitForAuthReady } from '@/api'

await waitForAuthReady()
await ensureAuthenticated()
```

### A `VillagesML` module using dedicated analysis APIs

```javascript
import {
  getSemanticNetwork,
  getSpatialHotspots,
  getRegionSimilarityPair
} from '@/api'

const network = await getSemanticNetwork(params)
const hotspots = await getSpatialHotspots(params)
const pair = await getRegionSimilarityPair(params)
```

---

## Related Documentation

- Overall project structure: [README.md](./README.md) and [ARCHITECTURE.md](./ARCHITECTURE.md)
- `VillagesML` module docs: `docs/VillagesML/`
- Collaboration rules for adding a new standalone page/app: [CONTRIBUTING.md](./CONTRIBUTING.md)

If a future module such as `PhoneticToolbox` is added, its APIs should generally live under `project/src/api/PhoneticToolbox/`, reuse the existing auth layer, and only be promoted into the global `@/api` surface when that sharing is intentional.
