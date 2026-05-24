# Changelog

## [0.1.3] – 2026-05-22

### Fixed
- **Critical bugfix** — API requests returned 404 after install.
  Root cause: `hass.callApi("GET", path)` prepends `/api/`, but
  `API_BASE` had a leading `/` producing double-slash in the URL;
  the three backend view URLs also lacked the required `/api/` prefix.
- Fixed: `API_BASE` changed to relative path `"action_explorer"` so the
  final URL is `/api/action_explorer/entities` (no double-slash).
- Fixed: all three `HomeAssistantView.url` attributes now include the
  `/api/` prefix: `/api/action_explorer/entities`,
  `/api/action_explorer/actions/{entity_id}`, `/api/action_explorer/automation`.
- Fixed: `MANIFEST_VERSION` bump causes `panel_custom` to inject a
  `?v=<VERSION>` query string onto the JS URL, forcing a browser reload
  because HA serves static files with immutable cache headers.

### Changed
- README rewritten with step-by-step usage walkthrough, ASCII workflow
  diagram, quick-start table, example entity/action cheat sheet, and
  troubleshooting FAQ.



## [0.1.4] – 2026-05-22

### Fixed
- Entity list scroll position resetting to top when `render()` rebuilds the DOM.
  `render()` now captures `scrollTop` before `shadowRoot.replaceChildren()` and
  restores it immediately after, so scrolling is preserved across search re-renders.


## [0.1.5] – 2026-05-22

### Fixed
- Entity list scroll position kept resetting to top.
  Root cause: `set hass()` triggered a full `render()` on every HA state
  update, calling `shadowRoot.replaceChildren()` which destroyed and
  recreated the entire DOM. Changed to one-time layout in `_buildLayout()`
  with in-place data updates via `_populateEntityList()` and
  `_populateActionCard()` that only modify the text content of specific
  container elements. The `<div class="list">` element is never replaced,
  so its scroll position is naturally preserved.


## [0.1.6] – 2026-05-25

### Fixed
- Added defensive setup logging around static path, HTTP view, and custom panel
  registration. If setup fails, Home Assistant now gets a full traceback in the
  log and the config entry is unloaded cleanly before the original exception is
  re-raised. This makes sidebar panel setup failures diagnosable instead of
  leaving users with a missing panel and no useful log output.
