from __future__ import annotations

from homeassistant import config_entries

from .const import DOMAIN


class ActionExplorerConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Config flow for Action Explorer."""

    VERSION = 1

    async def async_step_user(self, user_input: dict | None = None):
        """Create the single Action Explorer config entry."""
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            return self.async_create_entry(title="Action Explorer", data={})

        return self.async_show_form(step_id="user", data_schema=None)
