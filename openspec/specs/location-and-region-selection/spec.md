# Location And Region Selection Specification

## Purpose

Define the shared main-app capability for selecting explicit locations, system regions, and user-defined custom regions across query, compare, map, and phonology workflows.

## Requirements

### Requirement: Shared location and region input supports mixed selection sources

The system SHALL support explicit location input together with region-based selection in the shared location input workflow.

#### Scenario: User selects explicit locations

- WHEN the user enters location names in the shared location input
- THEN the system SHALL resolve and preview the selected locations

#### Scenario: User selects system regions

- WHEN the user selects regions from the region selector
- THEN the system SHALL include those regions in the resolved location set

#### Scenario: User selects custom regions

- GIVEN custom regions are available to the authenticated user
- WHEN the user selects custom regions
- THEN the system SHALL include the custom-region locations in the resolved location set

### Requirement: Shared location input maintains a resolved-count preview and disabled state

The shared location workflow SHALL maintain the current resolved location count, preview text, and parent-facing disabled state for the active page.

#### Scenario: User has not provided any locations or regions

- WHEN explicit locations, selected regions, and selected custom-region locations are all empty
- THEN the component SHALL surface the current required-input state
- AND the component SHALL disable the parent run action

#### Scenario: Resolved locations are available

- WHEN the component resolves locations successfully
- THEN the component SHALL update the resolved count
- AND the component SHALL update the preview list used by the bottom-hint UI

### Requirement: Explicit get_locs parameter protection is distinct from workflow limits

The system SHALL distinguish explicit `locations` parameter protection from workflow-specific business limits.

#### Scenario: Too many explicit locations are provided

- GIVEN the request would send more than the supported explicit-location limit to `/get_locs/`
- WHEN the shared input validates the outgoing explicit locations
- THEN the system SHALL block the request before submission

#### Scenario: Region expansion exceeds a workflow-specific business limit

- GIVEN the resolved location count exceeds the active workflow's business limit
- WHEN the shared input validates the result count
- THEN the system SHALL surface the workflow limit state
- AND the system SHALL not treat that state as an explicit-location parameter overflow

#### Scenario: Region-selector changes would exceed the explicit-location request limit

- GIVEN the component is in selector mode rather than region text-input mode
- AND the newest region-selection change would cause explicit locations to exceed the request limit
- WHEN the shared input validates the outgoing explicit locations
- THEN the component SHALL revert to the last valid region-selection snapshot

### Requirement: Region input mode can switch between selector mode and text-entry mode

The system SHALL support the current alternate input mode used by workflows that require direct text entry for regions.

#### Scenario: Region input mode is enabled

- GIVEN a workflow enables region text-input mode
- WHEN the user types or selects region suggestions
- THEN the system SHALL resolve those region entries through the alternate region input flow

### Requirement: Input mode can load authenticated custom-feature location previews

The alternate region-input mode SHALL support the current authenticated-only custom-feature location preview behavior.

#### Scenario: Input mode is active for an authenticated user

- GIVEN the component is in input mode
- AND the user is authenticated
- WHEN the component has non-empty location or region input to evaluate
- THEN the component SHALL request the current custom-feature location preview set
- AND the component SHALL include that preview count in the total-count summary

#### Scenario: Input mode is active for an anonymous user

- GIVEN the component is in input mode
- AND the user is not authenticated
- WHEN the component evaluates custom-feature preview behavior
- THEN the component SHALL keep the custom-feature preview list empty
