# Result Presentation Specification

## Purpose

Define how the main app loads and presents the latest query-derived results and prepares downstream map state.

## Requirements

### Requirement: Result page resolves the latest shared query payload

The result page SHALL derive its active result mode from the latest shared query payload.

#### Scenario: Result page is opened after a query

- GIVEN a query workflow has stored a shared payload
- WHEN the user opens `/menu/result`
- THEN the result page SHALL load data according to the payload's source tab and parameters

### Requirement: Result rendering adapts to the originating query mode

The result page SHALL render different result presentations for different source modes.

#### Scenario: Tabular list result is rendered

- GIVEN the latest source mode is a list-oriented mode
- WHEN the result data loads successfully
- THEN the result page SHALL render the list-style result presentation

#### Scenario: Character or tone-oriented result is rendered

- GIVEN the latest source mode is character-oriented or tone-oriented
- WHEN the result data loads successfully
- THEN the result page SHALL render the specialized character/tone presentation

### Requirement: Result loading also prepares map state

Successful result loading SHALL prepare the merged map-ready state used by the map workflow.

#### Scenario: Result data and coordinates are both available

- WHEN result data and coordinate data are both loaded successfully
- THEN the system SHALL merge them into shared map state for downstream map rendering

#### Scenario: No result data is available

- WHEN the result page has no result data and is not loading
- THEN the page SHALL show an empty state and a way to return to query workflows
