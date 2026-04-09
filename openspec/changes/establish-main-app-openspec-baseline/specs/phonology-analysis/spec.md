## ADDED Requirements

### Requirement: Phonology area exposes four route-backed submodules

The system SHALL expose the current phonology area through four canonical sub-routes.

#### Scenario: Matrix route is opened

- WHEN a user opens `/menu/pho/matrix`
- THEN the system SHALL render the phonology matrix workflow

#### Scenario: Custom classification route is opened

- WHEN a user opens `/menu/pho/custom`
- THEN the system SHALL render the phonology classification workflow

#### Scenario: Count route is opened

- WHEN a user opens `/menu/pho/count`
- THEN the system SHALL render the syllable-count workflow

#### Scenario: Evolution route is opened

- WHEN a user opens `/menu/pho/evolution`
- THEN the system SHALL render the evolution workflow

### Requirement: Route-backed tab switching preserves the current phonology shell

The phonology page SHALL keep a shared shell while switching route-backed phonology submodules.

#### Scenario: User changes phonology tab

- WHEN the user switches between phonology tabs
- THEN the system SHALL navigate by canonical `/menu/pho/...` routes
- AND keep the phonology shell active while swapping the selected phonology submodule
