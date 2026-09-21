# Firefox MVP Acceptance Test

Test environment:

- Firefox: 155.0.1
- Platform: macOS
- Extension: temporary unpacked build from `dist/manifest.json`

## Automated gate

- [x] `npm test`
- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`
- [x] The 100-tab fixture retrieves its intended result with a short query.
- [x] `npm audit` reports zero known vulnerabilities.

## Confirmed runtime behavior

- [x] `Cmd+Shift+K` opens the Simple Tabs popup.
- [x] The search field receives focus immediately.
- [x] Firefox reports the tab-groups API as available.
- [x] Short queries return contextual open-tab results.
- [x] Arrow keys and Enter activate a selected tab.
- [x] Cross-window and collapsed-group activation complete from the background worker.

## Final manual checks

- [ ] With the palette open, close a displayed tab elsewhere, select the stale result,
  and verify the palette announces that results were refreshed without losing focus.
- [ ] Inspect the popup with Firefox Accessibility Inspector: the search control is a
  combobox, results are listbox options, the active option is selected, and status
  changes are announced.
- [ ] Check keyboard focus, text contrast, truncation, and scrolling with eight results.
- [ ] Confirm the extension console has no errors during the complete flow.

Task 6 and final release acceptance remain open until these manual checks are marked
complete.
