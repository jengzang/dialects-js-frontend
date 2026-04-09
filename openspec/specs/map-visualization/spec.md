# Map Visualization Specification

## Purpose

Define the current map-viewing, region-dividing, and custom-map behaviors of the main app.

## Requirements

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
