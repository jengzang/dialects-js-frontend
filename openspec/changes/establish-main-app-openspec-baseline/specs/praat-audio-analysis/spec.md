## ADDED Requirements

### Requirement: Praat workflow is organized by route-backed tabs

The system SHALL expose the current Praat workflow through route-backed tabs for upload, results, vowel space, and pitch tone.

#### Scenario: Praat route is opened without a tab query

- WHEN a user opens `/explore/tools/praat` without a `tab` query
- THEN the system SHALL default to the upload workflow

#### Scenario: Praat route is opened with a supported tab query

- WHEN a user opens `/explore/tools/praat` with a supported `tab` query
- THEN the system SHALL render the corresponding Praat tab state

### Requirement: Praat analysis uses a job-based lifecycle

The system SHALL use the current upload-and-job workflow to run audio analysis.

#### Scenario: User starts an analysis

- GIVEN an audio file is ready
- WHEN the user starts analysis
- THEN the system SHALL submit the current Praat analysis workflow
- AND expose job progress through the current job-status UI

### Requirement: Advanced Praat tabs depend on available analysis output

The Praat page SHALL only enable advanced result tabs when the required analysis output is available.

#### Scenario: Results are not available yet

- WHEN analysis output has not been produced yet
- THEN the results-dependent tabs SHALL remain unavailable

#### Scenario: Results enable advanced visualizations

- WHEN the required formant or pitch output becomes available
- THEN the corresponding advanced Praat tabs SHALL become available
