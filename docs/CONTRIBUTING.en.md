# Contributing

## Ground rules

- Treat the implementation under `project/` as the source of truth.
- When changing routing, runtime boundaries, deployment behavior, or i18n structure, update the docs in the same change.
- Keep the root `README.md` high level and move details into focused docs.

## Development workflow

```bash
cd project
npm install
npm run dev
```

Recommended checks before finishing a change:

```bash
npm run build
npm run test
```

If you changed locale files or copy:

```bash
npm run i18n:extract
```

## Documentation update checklist

Update docs when you change:

- entry routes
- the boundary between `src/main` and `src/VillagesML`
- deployment outputs or static entries
- i18n file structure
- VillagesML modules or `subtab` values

## Main documentation targets

- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/USER_GUIDE.md`
- `docs/VillagesML/FEATURE_OVERVIEW.md`
- `docs/VillagesML/USER_GUIDE.md`
- `project/DEPLOY.md`
- `project/src/i18n/README.md`
