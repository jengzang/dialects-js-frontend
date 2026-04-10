## ADDED Requirements

### Requirement: Dialect clustering route currently exists as a placeholder page

The system SHALL expose `/menu/cluster` as a routed main-app page, and that page SHALL currently remain a placeholder.

#### Scenario: User opens the clustering route

- WHEN a user opens `/menu/cluster`
- THEN the system SHALL render the dialect clustering page shell
- AND the page SHALL show its current placeholder/coming-soon state instead of a production clustering workflow
