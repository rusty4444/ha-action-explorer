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

