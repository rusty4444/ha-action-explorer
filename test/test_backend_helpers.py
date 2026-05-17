import importlib
import sys
import types
import unittest


def install_homeassistant_stubs():
    aiohttp = types.ModuleType("aiohttp")
    web = types.SimpleNamespace(Request=object, Response=object)
    aiohttp.web = web

    homeassistant = types.ModuleType("homeassistant")
    components = types.ModuleType("homeassistant.components")
    frontend = types.ModuleType("homeassistant.components.frontend")
    panel_custom = types.ModuleType("homeassistant.components.panel_custom")
    http = types.ModuleType("homeassistant.components.http")
    config_entries = types.ModuleType("homeassistant.config_entries")
    core = types.ModuleType("homeassistant.core")
    helpers = types.ModuleType("homeassistant.helpers")
    entity_registry = types.ModuleType("homeassistant.helpers.entity_registry")

    class HomeAssistantView:
        pass

    class StaticPathConfig:
        def __init__(self, *args, **kwargs):
            self.args = args
            self.kwargs = kwargs

    class ConfigEntry:
        pass

    class HomeAssistant:
        pass

    http.HomeAssistantView = HomeAssistantView
    http.StaticPathConfig = StaticPathConfig
    config_entries.ConfigEntry = ConfigEntry
    core.HomeAssistant = HomeAssistant
    frontend.async_remove_panel = lambda *args, **kwargs: None
    panel_custom.async_register_panel = lambda *args, **kwargs: None
    entity_registry.async_get = lambda hass: None

    sys.modules.update(
        {
            "aiohttp": aiohttp,
            "homeassistant": homeassistant,
            "homeassistant.components": components,
            "homeassistant.components.frontend": frontend,
            "homeassistant.components.panel_custom": panel_custom,
            "homeassistant.components.http": http,
            "homeassistant.config_entries": config_entries,
            "homeassistant.core": core,
            "homeassistant.helpers": helpers,
            "homeassistant.helpers.entity_registry": entity_registry,
        }
    )


class BackendHelperTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        install_homeassistant_stubs()
        cls.module = importlib.import_module("custom_components.action_explorer")

    def test_serialise_service_accepts_home_assistant_service_objects(self):
        service = object()
        result = self.module._serialise_service("light", "turn_on", service)
        self.assertEqual(result["service"], "light.turn_on")
        self.assertEqual(result["name"], "Turn On")
        self.assertTrue(result["recommended"])
        self.assertEqual(result["fields"], {})
        self.assertEqual(result["example_data"], {"brightness_pct": 70})

    def test_serialise_service_accepts_description_dicts(self):
        result = self.module._serialise_service(
            "cover",
            "set_cover_position",
            {"name": "Set position", "description": "Move cover", "fields": {"position": {}}},
        )
        self.assertEqual(result["name"], "Set position")
        self.assertEqual(result["description"], "Move cover")
        self.assertEqual(result["fields"], {"position": {}})
    def test_service_call_yaml_quotes_edge_case_strings(self):
        yaml = self.module._service_call_yaml(
            "Test quotes",
            "climate.living_room",
            "climate.set_hvac_mode",
            {"hvac_mode": "don't cool\nfast", "temperature": 21, "enabled": True, "preset": None},
        )
        self.assertIn('      hvac_mode: "don\'t cool\\nfast"', yaml)
        self.assertIn("      temperature: 21", yaml)
        self.assertIn("      enabled: true", yaml)
        self.assertIn("      preset: null", yaml)


if __name__ == "__main__":
    unittest.main()
