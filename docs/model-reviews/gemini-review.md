## Review: ha-action-explorer

**Structure:** HACS custom integration (`custom_components/action_explorer/`) + ES module frontend side panel. Clean separation: Python backend (3 API views), JS frontend (shadow DOM, no framework), build via esbuild.

---

### Blocking Issues

1. **`hacs.json` → `content_in_root: false` should be `true`**

   The repo has `custom_components/` at the repository root — the standard HACS layout. `content_in_root: false` tells HACS to look in a subdirectory instead, which will cause installation to fail with "repository structure not recognized" or silently install nothing. HACS docs: *"Set to `true` if the `custom_components` folder is at the root of your repository."*

   ```json
   // hacs.json line 3 — change to:
   "content_in_root": true
   ```

---

### Non-blocking Suggestions

1. **`services.yaml` is empty `{}`** — Valid (no services registered), but the file itself is unnecessary. A missing `services.yaml` is equivalent. Remove to avoid confusion from reviewers who expect services to be populated.

2. **`cache_headers=True` on `StaticPathConfig`** — Works in 2024.7+ but stale-JS concerns on panel bundles served from disk. `cache_headers=False` would force browsers to re-request on every panel load, making it easier to push updates without clearing caches. Trade-off: slightly more server load for JS fetches.

3. **No `.gitattributes`** — Not a blocker, but without one, Git on Windows may convert line endings. Add `* text=auto eol=lf` to prevent spurious diffs when contributors work across platforms.

4. **`hacs.json` minimum `homeassistant` is `"2024.7.0"`** — OK but ambitious. `async_register_static_paths` + `StaticPathConfig` were stable by then, but 2024.7 is over 18 months old as of May 2026. Consider bumping to `"2025.1.0"` or `"2025.3.0"` if you're not testing against older builds.

5. **No second commit to anchor the `main` branch** — Git status shows *"No commits yet"* with only untracked files. HACS clones the repo at a ref. An uncommitted `main` branch with no history will work, but your CI `validate.yml` workflow runs `git diff --exit-code` on the bundle — that diff is always empty on a fresh clone, but the `find ... pycache` check passing on CI depends on the runner not having build artifacts. Confirm the GH Actions run actually catches bundle drift in a PR context. Recommend making the initial commit.

6. **`async_unload_entry` doesn't clean up static paths** — `__init__.py` registers a static URL with `async_register_static_paths` in setup, but `async_unload_entry` only calls `frontend.async_remove_panel` without removing the static path registration. The paths persist across unload/reload cycles. Not harmful (HA deduplicates), but not clean.

7. **`"iot_class": "local_push"` is semantically wrong** — This integration doesn't push anything. It's a read-only side panel. HA docs define `local_push` for integrations that sendstate changes via local WebSocket. Your integration only responds to REST GET/POST calls from the panel on user interaction. The most accurate class would be `local_polling` (panel queries on demand from the browser, which is the user's browser polling HA), but since you never poll on a schedule either, omitting `iot_class` or using `calculated` is also defensible. This won't block HACS approval but may confuse reviewers.

8. **`entity_id` search is substring-only, case-insensitive, ≤250 results** — `__init__.py` line 160 uses `query not in haystack` (substring match, no tokenization). A user searching `"living"` matches `light.living_room` correctly, but searching `"room living"` (reversed) misses it. Not a blocker for an MVP, but the frontend search UX should at minimum trim and split on whitespace for multi-word queries — or move to a token-based approach if entity counts grow large.

---

### Verdict

**Blocking: 1 issue** — the `content_in_root` flag in `hacs.json` must be `true`. Installing with its current value of `false` will fail in HACS. Fix and retest.

**Non-blocking: 7 suggestions** — none prevent shipping, but items 2 (cache headers), 5 (initial commit), and 6 (unload cleanup) are worth addressing before a v0.1.0 tag.

The integration itself is sound: clean separation of concerns, no telemetry, safe `textContent` rendering, proper `config_flow` with `single_instance_allowed`, CI that catches bundle drift and stale artifacts. The Python API views validate inputs strictly (type checks, existence checks, domain matching). Overall a well-structured HACS-ready custom integration modulo the one blocking configuration error.
