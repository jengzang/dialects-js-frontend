# Query Workflows Specification

## Purpose

Define the current main query workflows for character queries, Middle Chinese feature queries, phoneme queries, and tone queries.

## Requirements

### Requirement: Query workflows are organized by dedicated route-backed modes

The system SHALL expose four canonical query modes on route-backed tabs.

#### Scenario: Character query route is opened

- WHEN a user opens `/menu/query/char`
- THEN the system SHALL render the character query workflow

#### Scenario: Middle Chinese query route is opened

- WHEN a user opens `/menu/query/zhonggu`
- THEN the system SHALL render the Middle Chinese query workflow

#### Scenario: Phoneme query route is opened

- WHEN a user opens `/menu/query/yinwei`
- THEN the system SHALL render the phoneme query workflow

#### Scenario: Tone query route is opened

- WHEN a user opens `/menu/query/tone`
- THEN the system SHALL render the tone query workflow

### Requirement: Query workflows combine content input with shared location selection

Each query mode SHALL combine its own content-selection UI with the shared location and region selection workflow.

#### Scenario: Character query accepts direct character input

- GIVEN the user is on `/menu/query/char`
- WHEN the user enters characters and selects valid locations
- THEN the system SHALL allow the query to run

#### Scenario: Structured query modes use selectors

- GIVEN the user is on `/menu/query/zhonggu`, `/menu/query/yinwei`, or `/menu/query/tone`
- WHEN the user completes the mode-specific selectors and valid location input
- THEN the system SHALL allow the query to run

### Requirement: Successful query execution seeds downstream result workflows

The system SHALL capture query context for downstream result and map presentation.

#### Scenario: Query is executed successfully

- WHEN a query workflow runs successfully
- THEN the system SHALL persist the submitted payload in the shared query/result state
- AND the system SHALL make the result workflow available for downstream rendering
