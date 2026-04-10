# Villages Exploration Specification

## Purpose

Define the current villages-related exploration features exposed from the main app.

## Requirements

### Requirement: Guangdong villages tree explorer is available

The system SHALL provide the current Guangdong villages tree explorer with lazy city loading and searchable loaded data.

#### Scenario: User opens the Guangdong villages tree page

- WHEN a user opens `/explore/villages/gd`
- THEN the system SHALL render the Guangdong villages tree explorer

#### Scenario: User loads a city tree

- WHEN the user requests a city tree
- THEN the system SHALL fetch and render the full normalized tree for that city

### Requirement: Table and local villages browsers are available

The system SHALL provide the current Guangdong villages table and YangChun villages browser.

#### Scenario: Guangdong villages table is opened

- WHEN a user opens `/explore/villages/table`
- THEN the system SHALL render the table browser for the Guangdong villages dataset

#### Scenario: YangChun villages browser is opened

- WHEN a user opens `/explore/villages/yc`
- THEN the system SHALL render the YangChun local villages browser

### Requirement: Main app exposes a VillagesML entry without specifying the full VillagesML workspace

The main app SHALL expose its current VillagesML entry point without claiming ownership of the full VillagesML runtime behavior.

#### Scenario: Main-app VillagesML page is opened

- WHEN a user opens `/explore/villages/ml`
- THEN the system SHALL render the current main-app VillagesML entry page
- AND that page SHALL host the current dashboard-style entry into VillagesML functionality
