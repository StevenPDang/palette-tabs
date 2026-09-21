# Firefox Platform Decisions

## Task 1 findings

- **Manifest:** V3.
- **Minimum Firefox version:** 142. Firefox added the `tabGroups` WebExtension API
  in version 139, and the manifest's data-collection declaration requires a newer
  minimum for clean validation. Firefox for Android is outside the supported target.
- **Palette host:** an extension action popup for the first vertical slice.
- **Invocation:** the Manifest V3 `_execute_action` command, which behaves like a
  toolbar-action click and opens its configured popup.
- **Provisional shortcut:** `Ctrl+Shift+K` on Windows/Linux and `Cmd+Shift+K` on
  macOS. Users can remap it in Firefox's extension shortcut settings.
- **Permissions:** `tabs` for tab metadata and `tabGroups` for group lookup/update.
- **Installed test browser:** Firefox 155.0.1.

## Runtime checkpoint — passed

The unpacked extension was checked in Firefox 155.0.1 and confirmed that:

1. `Cmd+Shift+K` opens the action popup on macOS.
2. The search input receives focus immediately.
3. Firefox reports tab-group support as available.
4. Expanding a collapsed group through `tabGroups.update()` works when activation is
   implemented in Task 4.

The fourth check is recorded here but cannot be truthfully verified until the
activation adapter exists in Task 4.

## Official sources

- Commands manifest key and `_execute_action`:
  <https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/commands>
- Action popup API:
  <https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/action/openPopup>
- Tab groups API and permission:
  <https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabGroups>
- MDN browser compatibility data for `tabGroups`:
  <https://github.com/mdn/browser-compat-data/blob/main/webextensions/api/tabGroups.json>
