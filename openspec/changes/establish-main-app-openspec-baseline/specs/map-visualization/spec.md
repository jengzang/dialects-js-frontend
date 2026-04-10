## ADDED Requirements

### Requirement: Map area exposes three canonical sub-routes

The map area SHALL expose the current three route-backed map tabs.

#### Scenario: Standard map route is opened

- WHEN a user opens `/menu/map/view`
- THEN the system SHALL render the main map view

#### Scenario: Divide route is opened

- WHEN a user opens `/menu/map/divide`
- THEN the system SHALL render the divide workflow

#### Scenario: Custom route is opened

- WHEN a user opens `/menu/map/custom`
- THEN the system SHALL render the custom map workflow

### Requirement: Map tab switching preserves mounted workflow state

The map page SHALL preserve the mounted state of its current map, divide, and custom workflow components while switching tabs.

#### Scenario: User switches between map tabs

- WHEN the user switches between `/menu/map/view`, `/menu/map/divide`, and `/menu/map/custom`
- THEN the page SHALL keep the tab content components mounted
- AND use visibility switching rather than remounting those workflows

### Requirement: Main map view reflects current compare and feature state

The main map tab SHALL surface compare-aware and feature-aware controls based on shared map state.

#### Scenario: Compare mode is active

- GIVEN the shared map mode is compare
- WHEN the user is on the main map tab
- THEN the map UI SHALL show the active comparison pair badge

#### Scenario: Feature mode is active

- GIVEN the shared map mode is feature
- WHEN feature-bearing merged data is available
- THEN the map UI SHALL allow the user to inspect or switch the active feature

### Requirement: Feature selection mirrors current shared map feature state

The main map tab SHALL mirror its visible feature selection into shared map feature state.

#### Scenario: Feature-bearing merged data becomes available

- GIVEN merged map data contains one or more features
- WHEN the main map tab evaluates the available feature list
- THEN it SHALL select a valid active feature
- AND write that feature into shared map state

#### Scenario: No features are available

- WHEN merged map data has no available features
- THEN the main map tab SHALL clear the active feature selection from shared map state

### Requirement: Custom map workflows can submit and load custom feature data

The map area SHALL support the current custom-data flow used to submit and load user-defined map features.

#### Scenario: User submits custom map data

- WHEN the user submits custom map data successfully
- THEN the system SHALL refresh the current custom layer state

#### Scenario: Feature is loaded through route query parameters

- GIVEN the current route contains a custom feature request
- WHEN the main map tab processes that request
- THEN the system SHALL load the feature into custom map state
- AND clear the temporary loading query parameters afterward

#### Scenario: Custom feature query is processed successfully

- WHEN the route-driven custom feature load succeeds
- THEN the map page SHALL enable custom-data visibility
- AND switch the shared map mode to the current feature mode
