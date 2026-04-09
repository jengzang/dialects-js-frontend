## ADDED Requirements

### Requirement: Compare workflows are organized by dedicated route-backed modes

The system SHALL expose the current compare workflows on route-backed tabs.

#### Scenario: Character comparison route is opened

- WHEN a user opens `/menu/compare/char`
- THEN the system SHALL render the character comparison workflow

#### Scenario: Middle Chinese comparison route is opened

- WHEN a user opens `/menu/compare/zhonggu`
- THEN the system SHALL render the Middle Chinese comparison workflow

#### Scenario: Tone comparison route is opened

- WHEN a user opens `/menu/compare/tone`
- THEN the system SHALL render the tone-class comparison workflow

### Requirement: Character comparison uses two inputs and one comparison dimension

The character comparison workflow SHALL compare two single-character inputs against one selected dimension.

#### Scenario: User configures a character comparison

- GIVEN the user is on `/menu/compare/char`
- WHEN the user enters two characters, selects one dimension, and provides valid locations
- THEN the system SHALL allow the character comparison to run

### Requirement: Middle Chinese comparison supports grouped condition sets

The Middle Chinese comparison workflow SHALL support building two groups of selected condition items from a shared selector.

#### Scenario: User builds two Middle Chinese groups

- GIVEN the user is on `/menu/compare/zhonggu`
- WHEN the user adds selected condition items into group 1 and group 2 and provides valid locations
- THEN the system SHALL allow the Middle Chinese comparison to run

### Requirement: Tone comparison supports selecting two tone classes

The tone comparison workflow SHALL support choosing up to two tone classes before running a comparison.

#### Scenario: User compares two tone classes

- GIVEN the user is on `/menu/compare/tone`
- WHEN the user selects two tone classes and valid locations
- THEN the system SHALL allow the tone comparison to run
