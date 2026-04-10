# App Shell And Navigation Specification

## Purpose

Define the current main-app shell, canonical route families, and bridge behavior that normalize legacy entry patterns into the current path-based navigation model.

## Requirements

### Requirement: Canonical path-based main app navigation

The system SHALL expose the main app through canonical path routes instead of query-identified top-level pages.

#### Scenario: Root route opens the main home page

- WHEN a user opens `/`
- THEN the system SHALL render the main site home page

#### Scenario: Canonical menu workflow routes are available

- WHEN a user opens a supported `/menu/...` route
- THEN the system SHALL render the matching main-app workflow page

#### Scenario: Canonical explore workflow routes are available

- WHEN a user opens a supported `/explore/...` route
- THEN the system SHALL render the matching explore workflow page

### Requirement: Legacy query-driven entry points are normalized

The system SHALL preserve current compatibility bridges that translate legacy query-based entry patterns into canonical path routes.

#### Scenario: Legacy menu entry is normalized

- GIVEN a user lands on `/menu` with legacy query parameters
- WHEN the menu entry bridge resolves those parameters
- THEN the system SHALL replace the route with the matching canonical `/menu/...` path

#### Scenario: Legacy explore entry is normalized

- GIVEN a user lands on `/explore` with legacy query parameters
- WHEN the explore entry bridge resolves those parameters
- THEN the system SHALL replace the route with the matching canonical `/explore/...` path

### Requirement: Main app can bridge into the separate VillagesML runtime

The main app SHALL preserve its current bridge route into the standalone VillagesML runtime.

#### Scenario: VillagesML route is handed off externally

- WHEN a user opens `/villagesML/...`
- THEN the main router SHALL render the bridge component
- AND the browser SHALL be redirected to the same full path for the VillagesML runtime to own
