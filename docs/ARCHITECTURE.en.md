# Architecture

## Repository split

The repository is split into:

- `docs/` for documentation
- `project/` for the actual frontend application

All runtime code, build scripts, tests, and deployment assets live under `project/`.

## Runtime split

The frontend is no longer a single runtime. It is split into:

- the main application under `project/src/main`
- the `VillagesML` sub-application under `project/src/VillagesML`

This split is reflected both in source structure and in Vite build entries.

## Build entries

`project/vite.config.js` currently builds six HTML entry points:

- `index.html`
- `auth/index.html`
- `menu/index.html`
- `intro/index.html`
- `explore/index.html`
- `villagesML/index.html`

The router uses `createWebHistory()`, so deployment must support history fallback.

## Main application

Main application entry:

- `project/src/main/main.js`
- `project/src/main/App.vue`
- `project/src/main/router.js`

Primary routes:

- `/`
- `/menu`
- `/explore`
- `/intro`
- `/auth`
- `/auth/data`
- `/auth/regions`

The main router also contains a bridge route for `/villagesML/*`, whose only job is to hand off navigation to the VillagesML app.

## VillagesML application

VillagesML entry:

- `project/src/VillagesML/app/main.js`
- `project/src/VillagesML/app/App.vue`
- `project/src/VillagesML/app/router.js`

Current internal structure:

```text
src/VillagesML/
  app/
  components/
  config/
  dashboard/
  store/
  workspace/
    VillagesMLWorkspace.vue
    modules/
      character/
      ml/
      pattern/
      regional/
      search/
      semantic/
      spatial/
      system/
      village/
```

Important distinction:

- `/explore?page=VillagesML` remains a main-app dashboard / gateway page
- `/villagesML?...` is the actual VillagesML workspace runtime

## Shared layers

The repository still keeps several shared layers at `project/src/`:

- `api/`
- `assets/`
- `components/`
- `i18n/`
- `layouts/`
- `utils/`

These are shared infrastructure layers, not separate applications.

## Routing notes

Important behaviors in the current implementation:

- `/explore?page=VillagesML` shows the dashboard in the main app
- when `page=VillagesML` also contains a non-dashboard `module`, the main app redirects to `/villagesML?...`
- `/explore` now defaults to `Praat`

## Deployment constraint

The most important deployment rule is:

- `/villagesML`
- `/villagesML/*`

must resolve to `project/villagesML/index.html`, not to the main app `index.html`.

If this rule is missing, the bridge route will keep handing off to the same URL and the user will not enter the VillagesML runtime correctly.

## Testing status

The repository currently has only a minimal smoke test under `project/tests/smoke.test.js`.
That means architecture changes should be verified mainly by:

- `npm run build`
- route checks
- manual runtime checks
