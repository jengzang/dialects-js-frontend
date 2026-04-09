## ADDED Requirements

### Requirement: Result page resolves the latest shared query payload

The result page SHALL derive its active result mode from the latest shared query payload.

#### Scenario: Result page is opened after a query

- GIVEN a query workflow has stored a shared payload
- WHEN the user opens `/menu/result`
- THEN the result page SHALL load data according to the payload's source tab and parameters

#### Scenario: A newer payload replaces an in-flight older payload

- GIVEN the result page is already loading one payload
- WHEN a newer shared payload arrives
- THEN the page SHALL treat the newer payload as authoritative
- AND stale in-flight responses SHALL not overwrite the newer result state

### Requirement: Result loading exposes the current loading timer behavior

The result page SHALL expose the current loading timer and long-wait warning behavior while a payload is being resolved.

#### Scenario: Result loading begins

- WHEN the result page begins processing a new shared payload
- THEN the page SHALL enter its loading state
- AND start the current elapsed-time timer

#### Scenario: Loading crosses the long-wait threshold

- WHEN the active result load exceeds the current long-wait threshold
- THEN the page SHALL surface the current long-wait warning state

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

#### Scenario: Structured query result updates result-cache mode metadata

- GIVEN the latest source mode is a structured query mode
- WHEN the result data loads successfully
- THEN the page SHALL update the shared result-cache mode and feature metadata for downstream use

### Requirement: Result loading also prepares map state

Successful result loading SHALL prepare the merged map-ready state used by the map workflow.

#### Scenario: Result data and coordinates are both available

- WHEN result data and coordinate data are both loaded successfully
- THEN the system SHALL merge them into shared map state for downstream map rendering

#### Scenario: Result loading starts from feature-mode map state

- WHEN the result page starts loading a new payload
- THEN it SHALL reset the shared map mode to the current feature-oriented result mode before preparing merged data

#### Scenario: Result loading finishes successfully

- WHEN the tab-specific result data and coordinate data are both resolved successfully
- THEN the page SHALL update shared map data and merged-data state
- AND the page SHALL snapshot the latest result list into the shared result cache

#### Scenario: No result data is available

- WHEN the result page has no result data and is not loading
- THEN the page SHALL show an empty state and a way to return to query workflows
