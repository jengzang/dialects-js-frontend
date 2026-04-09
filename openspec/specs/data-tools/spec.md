# Data Tools Specification

## Purpose

Define the current main-app data tooling surface for workbook checking, workbook merging, Jyutping-to-IPA conversion, and admin table management.

## Requirements

### Requirement: Check tool supports upload, review, and edit workflows

The system SHALL provide the current check-tool workflow for uploading a file, inspecting issues, and editing table content.

#### Scenario: User opens the check tool

- WHEN a user opens `/explore/tools/check`
- THEN the system SHALL present the upload-first check-tool workflow

#### Scenario: Uploaded file enters the review workspace

- GIVEN a file upload succeeds
- WHEN the check workspace is initialized
- THEN the system SHALL provide the current issue-review and editing interface

### Requirement: Merge tool supports the current multi-step merge workflow

The system SHALL provide the current three-step workbook merge workflow.

#### Scenario: User progresses through merge steps

- WHEN a user opens `/explore/tools/merge`
- THEN the system SHALL expose reference selection, file selection, and result steps in sequence

### Requirement: Jyutping-to-IPA tool supports batch conversion and rule configuration

The system SHALL provide the current Jyutping-to-IPA batch conversion workflow.

#### Scenario: User processes a workbook for conversion

- WHEN a user uploads a supported workbook on `/explore/tools/jyut2ipa`
- THEN the system SHALL run the current batch conversion workflow
- AND the page SHALL support progress display, preview, and result download

#### Scenario: User edits conversion rules

- WHEN the user opens the conversion configuration modal
- THEN the system SHALL expose the current editable conversion-rule interface

### Requirement: Table management is restricted to the current admin workflow

The system SHALL restrict the table-management workspace to the current admin-only workflow.

#### Scenario: Non-admin opens table management

- WHEN a non-admin user opens `/explore/manage`
- THEN the system SHALL show the current access-denied state

#### Scenario: Admin opens table management

- GIVEN the user has admin access
- WHEN the user opens `/explore/manage`
- THEN the system SHALL provide the current database/table configuration and table-browsing workflow
