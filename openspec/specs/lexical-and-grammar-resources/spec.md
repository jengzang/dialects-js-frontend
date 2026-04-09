# Lexical And Grammar Resources Specification

## Purpose

Define the current main-app lexical and grammar resource workflows, including YuBao vocabulary and grammar browsing plus the YangChun spoken lexicon table.

## Requirements

### Requirement: YuBao resources support vocabulary and grammar tabs

The system SHALL provide the current YuBao resource workflow with separate vocabulary and grammar modes.

#### Scenario: User switches YuBao mode

- WHEN the user changes between `vocabulary` and `grammar`
- THEN the system SHALL update the active YuBao resource mode

### Requirement: YuBao resources support multiple presentation modes

The YuBao workflow SHALL support the current table, card, and map-oriented presentation modes.

#### Scenario: User enters a valid YuBao query

- GIVEN the user has provided a valid YuBao search input
- WHEN the user selects a presentation mode
- THEN the system SHALL render the corresponding YuBao presentation for that input

#### Scenario: User has not provided a valid YuBao query

- WHEN the current YuBao input is empty or incomplete
- THEN the system SHALL keep the YuBao page in its current empty-state guidance instead of rendering query results

### Requirement: YangChun spoken lexicon is available as a table resource

The system SHALL provide the current YangChun spoken lexicon table and its cross-link to YangChun villages.

#### Scenario: YangChun spoken page is opened

- WHEN a user opens `/explore/yc-spoken`
- THEN the system SHALL render the spoken-lexicon table

#### Scenario: User follows the villages cross-link

- WHEN the user activates the YangChun villages link from the spoken page
- THEN the system SHALL navigate to `/explore/villages/yc`
