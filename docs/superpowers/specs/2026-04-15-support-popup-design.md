# Support Popup Unification Design

Date: 2026-04-15

## Scope

This change unifies the three existing donation QR-code popups into a single shared component and adds a donor roster section to that shared popup.

The user-approved scope is:

- Rename `project/src/main/components/popup/HomeSupportPopup.vue` to `project/src/main/components/popup/SupportPopup.vue`
- Keep the popup content consistent with the current homepage popup
- Replace the inline QR modals in `LikeAuthor.vue` and `AboutPage.vue` with the shared popup component
- Add a donor roster section that lists donor names and donation amounts
- Store the donor list as a static array inside the shared popup component for the first version

## Current State

There are currently three separate implementations of the donation popup:

- Homepage footer uses `HomeSupportPopup.vue`
- `project/src/main/views/intro/LikeAuthor.vue` contains its own inline `AppModal`
- `project/src/main/views/menu/support/AboutPage.vue` contains its own inline `AppModal`

The title and subtitle are effectively the same, but the implementations are duplicated and the homepage popup includes QR labels that the other two do not.

## Approved Design

### Shared component

The homepage popup implementation becomes the canonical shared popup.

- Rename `HomeSupportPopup.vue` to `SupportPopup.vue`
- Preserve the existing homepage visual structure as the baseline
- Continue to use `AppModal` as the modal container

### Call sites

All three locations will render the renamed shared component directly:

- `project/src/main/views/HomePage.vue`
- `project/src/main/views/intro/LikeAuthor.vue`
- `project/src/main/views/menu/support/AboutPage.vue`

These call sites will only manage open/close state. They will not keep their own modal markup.

### Content model

All three popups will use the same content as the current homepage popup:

- Same title
- Same subtitle
- Same WeChat and Alipay QR labels
- Same QR image assets

To minimize change scope, the shared component will own this content directly and will not introduce a new config file in this step.

### Donor roster

The shared popup will gain a donor roster section below the QR-code area.

The first version will use a local static array in `SupportPopup.vue` with entries shaped as:

```js
{ name: 'Donor Name', amount: '100' }
```

The exact entries will be filled during implementation after the user provides the donor names and amounts.

### Layout

The popup layout will remain close to the current homepage popup:

1. Title in the modal header
2. Subtitle near the top of the content area
3. Two QR codes with labels
4. Donor roster list below the QR section

If the donor roster increases content height, scrolling will continue to rely on the existing `AppModal` content area behavior.

## Out of Scope

The following are explicitly out of scope for this step:

- Changing router behavior
- Moving donor data to API, remote JSON, or a new config module
- Rewriting surrounding page copy
- Refactoring unrelated modal behavior
- Changing QR assets

## Verification Plan

Implementation verification will check:

- all three entry points open the same shared popup component
- homepage content remains visually consistent with the current homepage popup
- the donor roster renders name and amount correctly
- no unrelated Chinese copy or emoji text is changed or corrupted
- only the requested files are modified
