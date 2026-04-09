# Phonology Analysis Specification

## Purpose

Define the current route-backed phonology workflows for phonology matrix browsing, phonology classification, syllable counting, and evolution views.

## Requirements

### Requirement: Phonology area exposes four route-backed submodules

The system SHALL expose the current phonology area through four canonical sub-routes.

#### Scenario: Matrix route is opened

- WHEN a user opens `/menu/pho/matrix`
- THEN the system SHALL render the phonology matrix workflow

#### Scenario: Custom classification route is opened

- WHEN a user opens `/menu/pho/custom`
- THEN the system SHALL render the phonology classification workflow

#### Scenario: Count route is opened

- WHEN a user opens `/menu/pho/count`
- THEN the system SHALL render the syllable-count workflow

#### Scenario: Evolution route is opened

- WHEN a user opens `/menu/pho/evolution`
- THEN the system SHALL render the evolution workflow

### Requirement: Route-backed tab switching preserves the current phonology shell

The phonology page SHALL keep a shared shell while switching route-backed phonology submodules.

#### Scenario: User changes phonology tab

- WHEN the user switches between phonology tabs
- THEN the system SHALL navigate by canonical `/menu/pho/...` routes
- AND keep the phonology shell active while swapping the selected phonology submodule

#### Scenario: User revisits a phonology submodule

- WHEN the user returns to a previously opened phonology submodule during the same session
- THEN the phonology shell SHALL keep that submodule mounted through the current cached-tab behavior

### Requirement: Phonology matrix workflow is location-driven and URL-synchronized

The matrix workflow SHALL run against the currently matched locations and synchronize successful runs with the route query.

#### Scenario: User loads the phonology matrix with matched locations

- GIVEN the user is on `/menu/pho/matrix`
- WHEN one or more locations are matched and the user runs the matrix query
- THEN the system SHALL request the phonology matrix for those matched locations

#### Scenario: Matrix query succeeds

- WHEN the matrix query returns successfully
- THEN the workflow SHALL store the returned matrix data
- AND write the current matched locations into the route query

#### Scenario: Matrix route opens with initial locations in the URL

- GIVEN the current route already contains locations for the matrix workflow
- WHEN the location matcher finishes resolving at least one matching location
- THEN the workflow SHALL auto-run the matrix query once

#### Scenario: Browser navigation changes matrix locations

- GIVEN matrix data is currently displayed
- WHEN browser navigation changes the route locations away from the current matched locations
- THEN the workflow SHALL clear the current matrix data and error state

### Requirement: Custom phonology classification binds feature, columns, and locations into URL-backed state

The custom phonology classification workflow SHALL keep its feature, column selection, and locations aligned with route-backed state.

#### Scenario: User changes the current phonology feature

- GIVEN the user is on `/menu/pho/custom`
- WHEN the current feature changes
- THEN the workflow SHALL clear the current matrix data and error state
- AND reset the horizontal, vertical, and cell-row columns to that feature's current defaults

#### Scenario: Custom classification query succeeds

- GIVEN the user is on `/menu/pho/custom`
- WHEN the workflow runs successfully
- THEN the system SHALL request classification data using the current internal Chinese feature and column values
- AND transform the returned matrix into the current table and cell-detail structure
- AND synchronize the feature, columns, and matched locations into the route query

#### Scenario: Custom route opens with a valid query state

- GIVEN the current route contains valid custom phonology parameters and one or more locations
- WHEN the location matcher finishes resolving at least one matching location
- THEN the workflow SHALL auto-run the custom classification query once

#### Scenario: Browser navigation updates custom phonology state

- GIVEN the user is on `/menu/pho/custom`
- WHEN browser navigation changes the route-backed feature, columns, or locations
- THEN the workflow SHALL update those controls from the route state
- AND clear the current matrix data when the route locations no longer match the current matched locations

### Requirement: Syllable counting surfaces aggregated and per-location feature counts

The count workflow SHALL query feature counts for the current matched locations and present both aggregated and location-level views.

#### Scenario: Count workflow runs successfully

- GIVEN the user is on `/menu/pho/count`
- WHEN the workflow runs successfully for one or more matched locations
- THEN the system SHALL store the returned per-location feature data
- AND compute the aggregated feature counts used by the summary presentation

#### Scenario: User inspects the locations for an aggregated entry

- GIVEN the count workflow is displaying aggregated syllable statistics
- WHEN the user opens the location detail for an aggregated entry
- THEN the workflow SHALL show the current modal with the syllable, feature type, total count, and contributing location list

### Requirement: Evolution workflow combines demo browsing with authenticated single-location querying

The evolution workflow SHALL provide demo-backed exploration by default and restrict real queries to authenticated single-location runs.

#### Scenario: Evolution route opens before any real query

- GIVEN the user is on `/menu/pho/evolution`
- WHEN no real evolution query has completed in the current session
- THEN the workflow SHALL load the current demo dataset for the active query mode

#### Scenario: User changes the evolution query mode before a real query

- GIVEN the evolution workflow is still showing demo-backed data
- WHEN the query mode changes between the current value-based and status-based modes
- THEN the workflow SHALL reload the matching demo dataset

#### Scenario: Unauthenticated user attempts a real evolution query

- GIVEN the user is not authenticated
- WHEN the user tries to run the evolution query
- THEN the workflow SHALL block the query
- AND redirect the user to `/auth`

#### Scenario: Evolution query is missing required single-location inputs

- GIVEN the user is on `/menu/pho/evolution`
- WHEN the location selection is empty, contains more than one location, or the selected dimensions are missing or identical
- THEN the workflow SHALL reject the query and surface the current validation error behavior

#### Scenario: Authenticated evolution query succeeds

- GIVEN the user is authenticated
- WHEN a valid evolution query runs successfully
- THEN the workflow SHALL call the current query-mode-specific evolution API
- AND store the returned dataset as the current real-data state
- AND choose a current feature from the returned data before rendering the visualization

#### Scenario: User toggles Sankey display for current evolution data

- GIVEN the evolution workflow already has data to display
- WHEN the user enables or disables the Sankey view
- THEN the workflow SHALL re-render the current visualization using the same active data
