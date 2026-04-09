## ADDED Requirements

### Requirement: Character-class exploration is route-backed by tab and table state

The system SHALL support character-class exploration through the current tab-driven route state and, where applicable, table selection state.

#### Scenario: A character-class tab is opened

- WHEN a user opens `/explore/char-class` with a supported `tab` query
- THEN the system SHALL resolve the matching character-class page configuration

#### Scenario: A page exposes multiple tables

- GIVEN the active character-class page supports multiple tables
- WHEN the user changes the selected table
- THEN the system SHALL update the active table context for the current page

### Requirement: Character-class exploration supports presets and level hierarchies

The system SHALL support preset-driven and manual level hierarchy selection for the active character-class table.

#### Scenario: User applies a preset

- WHEN the user selects a preset
- THEN the system SHALL update the active level configuration to match that preset

#### Scenario: User edits the level hierarchy manually

- WHEN the user adds, removes, reorders, or changes levels
- THEN the system SHALL update the tree request configuration accordingly

### Requirement: Character-class exploration renders a searchable tree result

The system SHALL load and render a searchable tree for the active character-class configuration.

#### Scenario: Tree data loads successfully

- WHEN the current character-class tree request succeeds
- THEN the system SHALL display the normalized tree result

#### Scenario: User searches the loaded tree

- WHEN the user enters a search query
- THEN the system SHALL filter the rendered tree view against the current tree data
