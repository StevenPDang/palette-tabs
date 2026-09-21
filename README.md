# Simple Tabs

Simple Tabs is a keyboard-first Firefox extension for reaching any open tab without
manually opening tab groups or scanning browser windows. Press one shortcut, enter a
few title/domain/URL fragments, and press Enter to activate the best match.

The MVP targets desktop Firefox 142 and newer. Chrome support is planned, but is not
part of this build.

## Quick start

Requirements: desktop Firefox 142+ and a current Node.js/npm installation. The
project is currently tested with Firefox 155.0.1, Node.js 26.6.0, and npm 12.0.2.

```sh
npm ci
npm run build
```

Then load the extension temporarily:

1. Open `about:debugging#/runtime/this-firefox` in Firefox.
2. Select **Load Temporary Add-on…**.
3. Choose `dist/manifest.json` from this repository.
4. Press **Cmd+Shift+K** on macOS or **Ctrl+Shift+K** on Windows/Linux.

Firefox removes temporary add-ons on restart. Repeat the loading steps after
restarting the browser.

## Development

```sh
npm run dev
```

This watches source files and rebuilds `dist/`. Use **Reload** beside Simple Tabs in
`about:debugging` after a rebuild.

| Command | Purpose |
|---|---|
| `npm run dev` | Rebuild the unpacked extension when source changes |
| `npm run build` | Create a production build in `dist/` |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run focused tests while files change |
| `npm run typecheck` | Check strict TypeScript contracts |
| `npm run lint` | Run ESLint |

## Using the palette

- Start typing to fuzzy-match tab titles, domains, and URLs.
- Use **Up/Down** to move through results.
- Press **Enter** to activate the selected tab.
- Press **Escape** to close the palette.
- Click a result if using a pointer.

Results show the tab title, domain or URL, window, group when available, and a compact
last-used indicator. Selecting a grouped tab expands its group, focuses its browser
window, and activates the tab.

To change the shortcut, open `about:addons`, choose the gear menu, and select
**Manage Extension Shortcuts**.

## Permissions and privacy

Simple Tabs requests two Firefox permissions:

- `tabs` reads open-tab titles, URLs, access times, and window/group identifiers so
  the extension can search and activate them.
- `tabGroups` reads group context and expands a collapsed group when its tab is
  selected.

All matching happens locally in the extension. Simple Tabs has no network requests,
account, analytics, remote storage, or browsing-data persistence. Private tabs are
excluded.

## Architecture

```text
src/search/       Pure normalization, fuzzy matching, and ranking
src/browser/      Browser-neutral contract and Firefox adapter
src/background/   Privileged list/activation message handler
src/palette/      Popup UI, keyboard state, and presentation
src/shared/       Domain and runtime-message contracts
tests/            Unit and adapter tests with deterministic fakes
```

The popup never performs cross-window activation itself. It sends a validated message
to the background worker, which survives the popup closing when browser focus changes.
See [Firefox platform decisions](docs/platform-decisions.md) for compatibility details.

## Current scope

The MVP searches currently open, non-private tabs only. It does not yet search
bookmarks, history, recently closed tabs, or Firefox's address bar. It also does not
create, close, suspend, or reorganize tabs and groups.
