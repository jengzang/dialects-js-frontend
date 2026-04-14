# Documentation Center

> Central index for project docs, architecture notes, and collaboration rules

**Documentation Language:** English | [中文](./README.md)

---

## Maintenance Note (2026-04)

This page remains the documentation index. The notes below align it with the current codebase:

- The repository root mainly stores documentation and collaboration material; the actual frontend project lives in `project/`
- The current frontend runtime is a hybrid of the main site, the VillagesML sub-application, and a shared infrastructure layer:
  - `project/src/main`: main-site application
  - `project/src/VillagesML`: VillagesML sub-application
  - `project/src/api`, `project/src/i18n`, `project/src/layouts`, `project/src/components`, `project/src/styles`, `project/src/utils`: shared infrastructure used by both sides
- The current route semantics should be understood as:
  - `/menu/*`: main-site core flows
  - `/explore/*`: main-site tools and Explore gateway pages
  - `/explore/villages/ml`: main-site gateway shell for VillagesML
  - `/villagesML/*`: canonical path owned by the VillagesML sub-application
  - `/menu?tab=...` and `/explore?page=...`: legacy compatibility inputs that are translated into path routes at the entry layer
- The documents that should currently be treated as the primary up-to-date entry points are:
  - [root README](../README.md)
  - [architecture guide](./ARCHITECTURE.en.md)
  - [contributing guide](./CONTRIBUTING.en.md)
  - [VillagesML feature overview](./VillagesML/FEATURE_OVERVIEW.md)
  - [deployment guide](../project/DEPLOY.md)
  - [i18n guide](../project/src/i18n/README.md)

---

## Documentation Map

### Core Documents

#### [Architecture](./ARCHITECTURE.en.md)
Describes the current runtime and layering model:
- separation between the main site and the VillagesML sub-application
- multi-entry build model
- canonical path routing, bridge pages, and legacy compatibility
- state, API, and style layers
- current key directories and file map

#### [API Reference](./API.en.md)
Documents the major API layers:
- authentication APIs
- main-site query / geo / SQL / tool APIs
- Praat audio-analysis APIs
- VillagesML-specific analysis APIs
- central export surface and module boundaries

#### [User Guide](./USER_GUIDE.en.md)
User-facing guide for the product:
- main-site query and result flows
- maps and analysis tools
- Praat audio analysis
- data-management tools
- current Explore and VillagesML entry paths

#### [Design System](./DESIGN_SYSTEM.en.md)
Design and reuse guidance:
- global tokens and style layering
- layout shells and navigation patterns
- shared components and selectors
- style boundaries between the main site and VillagesML

#### [Contributing](./CONTRIBUTING.en.md)
Primary collaboration guide for contributors:
- review expectations and collaboration boundaries
- rules for changing existing features
- integration rules for new standalone tool modules
- shared component / auth / i18n / style reuse expectations
- pre-delivery and pre-commit checklists

### Module-Specific Documents

#### [VillagesML Feature Overview](./VillagesML/FEATURE_OVERVIEW.md)
Feature and API overview for the VillagesML module.

#### [VillagesML User Guide](./VillagesML/USER_GUIDE.md)
Usage guide for VillagesML users.

---

## Language Versions

### English Documentation
- [Documentation Index](./README.en.md)
- [Architecture](./ARCHITECTURE.en.md)
- [API Reference](./API.en.md)
- [User Guide](./USER_GUIDE.en.md)
- [Design System](./DESIGN_SYSTEM.en.md)
- [Contributing](./CONTRIBUTING.en.md)

### 中文文檔
- [文檔索引](./README.md)
- [架構文檔](./ARCHITECTURE.md)
- [API 文檔](./API.md)
- [用戶指南](./USER_GUIDE.md)
- [設計系統](./DESIGN_SYSTEM.md)
- [貢獻指南](./CONTRIBUTING.md)

---

## Quick Links

- [root README](../README.md) - project overview and local startup
- [deployment guide](../project/DEPLOY.md) - deployment instructions
- [i18n guide](../project/src/i18n/README.md) - translation structure and maintenance
- [VillagesML feature overview](./VillagesML/FEATURE_OVERVIEW.md) - VillagesML documentation entry

---

## Documentation Structure

```text
docs/
├── README.md
├── README.en.md
├── ARCHITECTURE.md
├── ARCHITECTURE.en.md
├── API.md
├── API.en.md
├── USER_GUIDE.md
├── USER_GUIDE.en.md
├── DESIGN_SYSTEM.md
├── DESIGN_SYSTEM.en.md
├── CONTRIBUTING.md
├── CONTRIBUTING.en.md
└── VillagesML/
    ├── FEATURE_OVERVIEW.md
    └── USER_GUIDE.md
```

---

## Suggested Reading Order

### For end users
1. Start with the [user guide](./USER_GUIDE.en.md).
2. If you mainly work in VillagesML, also read the [VillagesML user guide](./VillagesML/USER_GUIDE.md).
3. If a path or entry page seems confusing, check the latest route notes in the guide rather than older screenshots or bookmarks.

### For developers
1. Read the [architecture guide](./ARCHITECTURE.en.md) first.
2. Then read the [contributing guide](./CONTRIBUTING.en.md) to understand boundaries and ownership.
3. If you will touch `project/src/VillagesML`, also read the [VillagesML feature overview](./VillagesML/FEATURE_OVERVIEW.md).
4. Before changing shared APIs or shared styles, cross-check the [API reference](./API.en.md) and [design system](./DESIGN_SYSTEM.en.md).

### For maintainers and deployers
1. Review the [root README](../README.md) and [deployment guide](../project/DEPLOY.md).
2. Use the [architecture guide](./ARCHITECTURE.en.md) when debugging entry routing or bridge behavior.
3. Update the Chinese source docs first, then sync the English docs.

---

## Documentation Maintenance Rules

- Chinese docs remain the primary maintained source; English docs should be synced from them.
- When the code structure changes, update `README / ARCHITECTURE / CONTRIBUTING` first, then `API / USER_GUIDE / DESIGN_SYSTEM`.
- When a new standalone module is added, at minimum update the documentation index, architecture guide, and contributing guide.

---

## Getting Help

- **GitHub Issues:** report bugs or documentation gaps
- **Project maintainers:** confirm routing, ownership, and integration boundaries
- **Live demo:** [https://dialects.yzup.top](https://dialects.yzup.top)

---

**Thanks for using Chinese Dialect Atlas.**
