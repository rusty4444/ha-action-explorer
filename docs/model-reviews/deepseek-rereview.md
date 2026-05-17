HACS Review — ha-action-explorer (rusty4444/ha-action-explorer)
    
    Repo structure summary
    
    
    /
    ├── hacs.json                 ← content_in_root: false ✓
    ├── custom_components/
    │   └── action_explorer/     ← domain directory ✓
    │       ├── init.py
    │       ├── config_flow.py
    │       ├── const.py
    │       ├── manifest.json
    │       ├── services.yaml
    │       ├── brand/
    │       │   ├── icon.png
    │       │   └── icon.svg
    │       ├── www/
    │       │   └── action-explorer-panel.js
    │       └── translations/
    │           └── en.json
    ├── README.md
    └── .github/workflows/validate.yml
    
    
    
    
    Blocking Issues
    
    None found.
    
    Check: hacs.json content_in_root: false
    Status: Correct — domain lives in custom_components/action_explorer/
    ────────────────────────────────────────
    Check: Manifest present
    Status: manifest.json has all required keys: domain, name, version,
      codeowners, config_flow, dependencies, documentation, iot_class,
      issue_tracker
    ────────────────────────────────────────
    Check: Domain matches directory
    Status: domain: "action_explorer" == directory name ✓
    ────────────────────────────────────────
    Check: Brand icons
    Status: brand/icon.png (256×256 PNG) + brand/icon.svg present and valid
    ────────────────────────────────────────
    Check: Config flow
    Status: config_flow.py does async_set_unique_id +
      _abort_if_unique_id_configured — single-instance pattern correct
    ────────────────────────────────────────
    Check: Services YAML
    Status: Valid empty dict {} — acceptable for a panel without custom
      services
    ────────────────────────────────────────
    Check: Translations
    Status: translations/en.json has correct config.step.user and config.abort
      structure
    ────────────────────────────────────────
    Check: .gitignore clean
    Status: No stale compiled artifacts committed
    ────────────────────────────────────────
    Check: CI validates bundles
    Status: git diff --exit-code check ensures www/action-explorer-panel.js
      stays in sync with source
    ────────────────────────────────────────
    Check: No www/ at repo root
    Status: Correct — only custom_components/action_explorer/www/ exists, no
      root-level www/ confusion
    ────────────────────────────────────────
    Check: No test/ at repo root
    Status: Not a blocker (HACS ignores this), but worth noting below
    
    
    
    Non-blocking Suggestions
    
    1. hacs.json missing domains key — HACS 2.0 has been moving toward explicit domains in hacs.json. Add "domains": ["action_explorer"] to future-proof. Not required today but avoids a warning in newer HACS versions.
    
    2. services.yaml is empty {} — The panel doesn't register custom services (it uses the HA service registry read-only), so an empty YAML is technically fine. Consider either removing it (if no custom services are planned) or adding a comment explaining why it's empty — the current {} could confuse maintainers.
    
    3. No requirements.txt or dependency pins — The integration has no PyPI deps (only frontend + http bundled with HA core), so this is fine. Worth documenting explicitly in the README dev section.
    
    4. brand/icon.svg uses an inline <rect> background that may not render in dark-mode context — HA's brand guidelines usually prefer transparent-background SVGs. The PNG is 256×256 and will be used for most contexts; the SVG is a fallback. Low priority.
    
    5. iot_class: "local_push" — This custom panel doesn't register any entities and doesn't push state. The most accurate iot_class for a panel-only integration that reads state via REST endpoints is arguably "calculated" or "local_polling". "local_push" is misleading in HACS listings — users filter by this. Consider changing to "calculated" (the catch-all for integrations that don't fit the other categories).
    
    6. CI should lint YAML/JSON — The validate workflow checks Python compilation and bundle drift but doesn't validate hacs.json or manifest.json with jq or a schema checker. A lightweight python -c "import json; json.load(open('hacs.json'))" step would catch typos early.
    
    
    
    Verdict
    
    PASS — No blocking HACS issues. The repo follows the standard custom_components/<domain> layout, manifest is complete, config flow is correct, brand icons are present, and the CI validates bundle integrity. The content_in_root: false setting is correctly applied, matching HACS expectations for repos with a custom_components/ directory at root.
    
    Address suggestion #5 (iot_class) before you publish to the HACS default store — it affects filter accuracy for users browsing integrations.
