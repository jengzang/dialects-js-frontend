# User Guide

## Main entry routes

The current frontend is mainly used through:

- `/` for the home page
- `/menu` for main content sections
- `/explore` for tools and topic entry pages
- `/villagesML` for the VillagesML workspace
- `/auth` for authentication and user pages

## `/menu`

`/menu` uses query parameters such as:

- `/menu?tab=query`
- `/menu?tab=pho`
- `/menu?tab=compare`
- `/menu?tab=map`
- `/menu?tab=about`

## `/explore`

`/explore` uses the `page` query to switch tools or topic pages, for example:

- `/explore?page=praat`
- `/explore?page=check`
- `/explore?page=jyut2ipa`
- `/explore?page=merge`
- `/explore?page=gdVillages`
- `/explore?page=VillagesML`

The current default page is `Praat`.

## VillagesML

VillagesML has two different entry meanings:

### Dashboard inside the main app

```text
/explore?page=VillagesML
```

This is the gateway / dashboard view kept inside the main application.

### Actual VillagesML workspace

```text
/villagesML?module=search
/villagesML?module=semantic&subtab=indices
```

This is handled by the standalone VillagesML runtime.

## Authentication

Authentication-related pages are:

- `/auth`
- `/auth/data`
- `/auth/regions`

## Recommended route checks

When verifying a deployment, check at least:

1. `/`
2. `/menu?tab=query`
3. `/explore?page=praat`
4. `/explore?page=VillagesML`
5. `/villagesML?module=search`
6. `/auth`
