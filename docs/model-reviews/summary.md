# Model review summary

Reviews were run with multiple models and the blocking findings were triaged.

## Reviews

- `codex-review.md` — OpenAI Codex / GPT-5.5. Found two valid blockers:
  - Home Assistant service registry entries can be `Service` objects, not dictionaries.
  - `StaticPathConfig` requires HA 2024.7+, while `hacs.json` originally allowed 2024.6.
- `gemini-review.md` — Gemini 2.5 Pro via OpenRouter. Flagged `content_in_root: false` as blocking, but HACS integration docs say `custom_components/<domain>/...` at repo root is the valid standard layout; `content_in_root: true` is for integrations whose `manifest.json` is at repository root.
- `deepseek-rereview.md` — DeepSeek. Rechecked final HACS structure after fixes and found no blockers.
- `claude-review.md` — Anthropic request fell back to DeepSeek v4 Flash in Hermes; it found no blockers.

## Fixes applied

- Made `_serialise_service` accept both dict service descriptions and Home Assistant `Service` objects.
- Raised HACS minimum Home Assistant version to `2024.7.0`.
- Switched generated YAML string rendering to JSON-compatible quoting for strings and explicit `null` handling.
- Added backend helper tests for service object handling and YAML edge cases.
- Added `brand/icon.png` alongside `brand/icon.svg` for HACS brand compatibility.
- Changed manifest `iot_class` to `calculated` for a panel/helper integration.
- Added CI JSON validation for `hacs.json` and `manifest.json`.
