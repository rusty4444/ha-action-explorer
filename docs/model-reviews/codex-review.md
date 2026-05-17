**Blocking Issues**

- [custom_components/action_explorer/__init__.py:170](/Users/sam.russell/projects/ha-action-explorer/custom_components/action_explorer/__init__.py:170) treats `hass.services.async_services()` entries as service-description dicts. Home Assistant returns `Service` objects there, so `_serialise_service(... service_info.get(...))` at [line 91](/Users/sam.russell/projects/ha-action-explorer/custom_components/action_explorer/__init__.py:91) will raise `AttributeError` when an entity is selected. The core API shape is visible in HA Core `ServiceRegistry`: https://github.com/home-assistant/core/blob/2026.5.0/homeassistant/core.py#L2497-L2518.

- [hacs.json:5](/Users/sam.russell/projects/ha-action-explorer/hacs.json:5) advertises Home Assistant `2024.6.0`, but [__init__.py:9](/Users/sam.russell/projects/ha-action-explorer/custom_components/action_explorer/__init__.py:9) imports `StaticPathConfig`, which is absent in HA `2024.6.0` and present by `2024.7.0`. That makes the integration fail at import for a version HACS is allowed to install. Compare: https://github.com/home-assistant/core/blob/2024.6.0/homeassistant/components/http/__init__.py and https://github.com/home-assistant/core/blob/2024.7.0/homeassistant/components/http/__init__.py#L139-L144.

**Non-blocking Suggestions**

- [custom_components/action_explorer/__init__.py:103](/Users/sam.russell/projects/ha-action-explorer/custom_components/action_explorer/__init__.py:103) hand-builds YAML and does not validate `service_data` against the service schema. Use a YAML emitter and either validate through HA’s service schema or clearly describe output as an unvalidated draft.

- [custom_components/action_explorer/__init__.py:260](/Users/sam.russell/projects/ha-action-explorer/custom_components/action_explorer/__init__.py:260) unload removes the panel but leaves custom HTTP views/static routes registered. That is common in HA extensions, but reload/delete behavior should be tested.

- CI only runs JS tests and Python compilation. Add Home Assistant pytest coverage for config flow, setup, `/entities`, `/actions/{entity_id}`, and `/automation`; the service-registry crash would be caught immediately.

- README says “entity or device” and “see service schemas,” but the MVP currently only browses state entities and displays descriptions/field counts.

- Frontend rendering uses `textContent`; I did not see an obvious XSS issue in the panel.

**Verdict**

Do not release yet. The action list endpoint is functionally broken, and the HACS minimum HA version is incompatible with the imported HA API. I did not modify files. `node --test test/*.test.js` passed; I did not run build/py_compile because they would write generated files/bytecode.