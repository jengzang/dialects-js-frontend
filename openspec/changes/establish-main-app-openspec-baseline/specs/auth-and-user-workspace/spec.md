## ADDED Requirements

### Requirement: Authentication route supports login, registration, and profile flows

The system SHALL support login, registration, and authenticated profile flows on `/auth`.

#### Scenario: Unauthenticated user enters auth flow

- WHEN an unauthenticated user opens `/auth`
- THEN the system SHALL allow login and registration workflows

#### Scenario: Authenticated user enters profile flow

- GIVEN the user is authenticated
- WHEN the user opens `/auth` in a profile-oriented view
- THEN the system SHALL show profile information and profile-management actions

### Requirement: User-owned custom data workspace is available

The system SHALL provide a dedicated workspace for viewing and editing user custom data records.

#### Scenario: User custom data table is opened

- WHEN the user opens `/auth/data`
- THEN the system SHALL render the custom-data management table
- AND the page SHALL support search, pagination, edit, batch create, batch edit, and batch delete actions

### Requirement: User-owned custom regions workspace is available

The system SHALL provide a dedicated workspace for managing saved custom regions.

#### Scenario: User custom regions page is opened

- WHEN the user opens `/auth/regions`
- THEN the system SHALL render the saved custom regions list
- AND the page SHALL support create, edit, delete, refresh, and search actions
