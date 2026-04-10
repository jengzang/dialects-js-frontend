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

#### Scenario: Character inputs contain extra whitespace or more than one character

- GIVEN the user is on `/menu/compare/char`
- WHEN the user types whitespace, commas, or multiple characters into either character field
- THEN the workflow SHALL normalize that field to the current first effective character before submission

### Requirement: Compare run availability is controlled by mode-specific validation and shared location validity

The compare page SHALL disable or enable its run action using the active compare mode state, shared location validity, and current running state.

#### Scenario: Character compare mode is incomplete

- GIVEN the user is on `/menu/compare/char`
- WHEN either character field is empty or no comparison dimension is selected
- THEN the compare run action SHALL remain disabled

#### Scenario: Middle Chinese or tone compare mode is incomplete

- GIVEN the user is on `/menu/compare/zhonggu` or `/menu/compare/tone`
- WHEN the active mode does not yet satisfy its current selection rules
- THEN the compare run action SHALL remain disabled

#### Scenario: Shared location input reports an invalid state

- WHEN the shared location and region workflow reports a disabled state
- THEN the compare run action SHALL remain disabled regardless of compare-mode content

### Requirement: Middle Chinese comparison captures grouped condition snapshots from a shared selector

The Middle Chinese comparison workflow SHALL support building two groups of selected condition snapshots from a shared selector.

#### Scenario: User builds two Middle Chinese groups

- GIVEN the user is on `/menu/compare/zhonggu`
- WHEN the user adds selected condition items into group 1 and group 2 and provides valid locations
- THEN the system SHALL allow the Middle Chinese comparison to run

#### Scenario: Added group item preserves the current selector snapshot

- GIVEN the user is on `/menu/compare/zhonggu`
- WHEN the user adds the current selector state into one group
- THEN the workflow SHALL snapshot the current card, selected keys, selected values, exclude-column state, and generated combinations for that item

#### Scenario: Exclude-column settings do not match an existing group

- GIVEN a Middle Chinese comparison group already contains one or more items
- WHEN the user tries to add another item with a different exclude-column selection
- THEN the workflow SHALL block that add action
- AND surface the current exclude-settings mismatch warning

#### Scenario: Current comparison card changes

- GIVEN the user is on `/menu/compare/zhonggu`
- WHEN the current selector card changes between the current sound dimensions
- THEN the workflow SHALL clear both existing Middle Chinese groups

### Requirement: Tone comparison requires exactly two selected tone classes

The tone comparison workflow SHALL require exactly two selected tone classes before running a comparison.

#### Scenario: User compares two tone classes

- GIVEN the user is on `/menu/compare/tone`
- WHEN the user selects two tone classes and valid locations
- THEN the system SHALL allow the tone comparison to run

#### Scenario: Fewer or more than two tone classes are active

- GIVEN the user is on `/menu/compare/tone`
- WHEN the current tone-class selection is not exactly two items
- THEN the compare run action SHALL remain disabled

### Requirement: Successful compare execution seeds compare-aware map presentation

The compare workflows SHALL resolve compare results into shared map state and transition to the map view.

#### Scenario: Compare request completes successfully

- WHEN any compare workflow returns a successful result set
- THEN the system SHALL resolve coordinates for the returned locations
- AND merge the compare result data with that map data for downstream display

#### Scenario: Shared map state records the active compare mode

- WHEN a compare workflow stores its downstream map data
- THEN the shared map mode SHALL be set to the compare mode
- AND the shared compare type SHALL reflect whether the current workflow was character, Middle Chinese, or tone comparison

#### Scenario: Compare workflow initializes compare legend state

- WHEN a compare workflow stores downstream compare data
- THEN the system SHALL populate the compare legend groups for the active compare type

#### Scenario: Compare execution transitions to the map route

- WHEN a compare workflow stores downstream compare state successfully
- THEN the page SHALL navigate to `/menu/map/view`
