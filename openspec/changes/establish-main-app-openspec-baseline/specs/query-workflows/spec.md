## ADDED Requirements

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

### Requirement: Query run availability is controlled by tab-specific validation and shared location validity

The query page SHALL disable or enable its run action using the current tab validation state, shared location validity, and current running state.

#### Scenario: Character query is empty

- GIVEN the user is on `/menu/query/char`
- WHEN the character input is empty or whitespace-only
- THEN the query run action SHALL remain disabled

#### Scenario: Structured query tab reports invalid content state

- GIVEN the user is on a structured query tab
- WHEN the active selector workflow reports invalid tab content
- THEN the query run action SHALL remain disabled

#### Scenario: Shared location input reports an invalid state

- WHEN the shared location and region workflow reports a disabled state
- THEN the query run action SHALL remain disabled regardless of tab content validity

### Requirement: Character query input enforces the current effective-character limit

The character query workflow SHALL enforce the current effective-character limit on direct character input.

#### Scenario: Character input exceeds the effective-character limit

- GIVEN the user is on `/menu/query/char`
- WHEN the entered text exceeds the current effective-character limit
- THEN the page SHALL trim the input to that limit
- AND the page SHALL surface the current max-character warning behavior

### Requirement: Successful query execution seeds downstream result workflows

The system SHALL capture query context for downstream result and map presentation.

#### Scenario: Query is executed successfully

- WHEN a query workflow runs successfully
- THEN the system SHALL persist the submitted payload in the shared query/result state
- AND the system SHALL make the result workflow available for downstream rendering

#### Scenario: Query payload preserves its originating source mode

- WHEN the query page stores the shared payload
- THEN the payload SHALL include the current `_sourceTab`

#### Scenario: Structured query payload preserves mode-specific fields

- GIVEN the user runs a structured query mode
- WHEN the query page stores the shared payload
- THEN the payload SHALL preserve the current mode-specific selector output
- AND structured modes that support exclude-column state SHALL also preserve that exclude-column state

#### Scenario: Query execution transitions to the result route

- WHEN the query page stores the shared payload successfully
- THEN the page SHALL navigate to `/menu/result`
