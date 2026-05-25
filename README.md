# Action Explorer for Home Assistant
<p align="center">
  <a href="https://buymeacoffee.com/rusty4" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="50">
  </a>
</p>



> **"What can this device do?" — Action Explorer answers that.**

![Action Explorer screenshot](docs/screenshots/action-explorer.png)

Action Explorer is a Home Assistant custom panel that starts from the **thing you care about**: an entity or device. Pick any entity, see what actions Home Assistant supports for it, inspect the service schemas and examples, then generate a starter automation YAML block.

---

## Quick start

| Step | What to do |
|------|------------|
| 1 | [Install via HACS](#install-with-hacs) or [manually](#manual-install) |
| 2 | **Restart** Home Assistant |
| 3 | Settings → Devices & services → **Add integration** → search for **Action Explorer** |
| 4 | Open **Action Explorer** in the sidebar |

---

## Usage walkthrough

Once installed and added, you'll see **Action Explorer** in your sidebar. Here's how to use it:

### Step 1: Find your entity

![Entity search](docs/screenshots/action-explorer.png)

- Open **Action Explorer** from the sidebar.
- On the left panel, you'll see a search bar and a list of your entities.
- **Type** in the search box to filter — e.g. `kitchen`, `living room`, `light`.
- The list updates as you type.
- Each entry shows the **friendly name**, **entity ID** (e.g. `light.kitchen_island`), and **current state**.

### Step 2: Pick an entity

- **Click** any entity from the list.
- The right panel loads all actions (services) available for that entity.

### Step 3: Browse available actions

![Actions panel](docs/screenshots/action-explorer.png)

Actions are grouped and ranked:
- **Recommended** actions appear first (marked with a blue badge).
- Each action card shows:
  - The **service name** (e.g. `light.turn_on`)
  - A **description** of what it does
  - A **Generate** button

Common actions you'll see per entity type:

| Entity type | Typical actions |
|-------------|----------------|
| Light | `turn_on`, `turn_off`, `toggle` |
| Switch | `turn_on`, `turn_off`, `toggle` |
| Cover (blinds/garage) | `open_cover`, `close_cover`, `set_cover_position` |
| Climate | `set_temperature`, `set_hvac_mode`, `turn_on`, `turn_off` |
| Media player | `media_play`, `media_pause`, `volume_set` |
| Fan | `turn_on`, `turn_off`, `set_percentage` |
| Lock | `lock`, `unlock` |
| Scene | `turn_on` |
| Button | `press` |

### Step 4: Generate automation YAML

- Click the **Generate** button on any action card.
- A **Starter automation YAML** block appears at the bottom of the panel.
- The YAML is pre-filled with:
  - A human-readable **alias**
  - The service call with your entity as the **target**
  - Example **data** values (e.g. brightness for `light.turn_on`)
  - Empty `triggers` and `conditions` sections ready for you to fill in

### Step 5: Use the YAML in your automations

1. **Copy** the generated YAML.
2. Go to **Settings → Automations & scenes → Create automation → Edit in YAML**.
3. **Paste** the YAML.
4. Add your trigger (e.g. time, motion sensor, button press).
5. Add any conditions.
6. **Save**.

> ⚠️ The generated YAML is a **starter snippet** — you need to add a trigger and review before saving. Action Explorer does not write directly to your automations.

---

## Workflow at a glance

```
  ┌─────────────────────────────┐
  │  1. Open Action Explorer    │
  │     from sidebar             │
  └─────────────┬───────────────┘
                ▼
  ┌─────────────────────────────┐
  │  2. Search / select entity  │
  │     (e.g. "kitchen light")  │
  └─────────────┬───────────────┘
                ▼
  ┌─────────────────────────────┐
  │  3. Browse actions          │
  │     Recommended ones first  │
  └─────────────┬───────────────┘
                ▼
  ┌─────────────────────────────┐
  │  4. Click "Generate"        │
  │     on the action you want  │
  └─────────────┬───────────────┘
                ▼
  ┌─────────────────────────────┐
  │  5. Copy YAML, paste into   │
  │     new automation          │
  │  6. Add trigger & save      │
  └─────────────────────────────┘
```

---

## Install with HACS

1. Open HACS (Home Assistant Community Store).
2. Go to the **Integrations** tab.
3. Click the **three-dot menu** (⋮) in the top right → **Custom repositories**.
4. Paste this URL and select **Integration** as the category:
   ```
   https://github.com/rusty4444/ha-action-explorer
   ```
5. Click **Add**.
6. Close the dialog. You should now see **Action Explorer** in the HACS integrations list.
7. Click **Download**.
8. **Restart Home Assistant**.
9. Go to **Settings → Devices & services → Add integration** → search for **Action Explorer** → click it.
10. Open **Action Explorer** in the sidebar — you're ready to explore!

---

## Manual install

1. Download or clone this repository.
2. Copy the `custom_components/action_explorer` folder into your Home Assistant `custom_components` directory:
   ```bash
   cp -r custom_components/action_explorer /path/to/ha/config/custom_components/
   ```
3. **Restart** Home Assistant.
4. Settings → Devices & services → Add integration → **Action Explorer**.
5. Open **Action Explorer** in the sidebar.

---

## FAQ

**Q: I installed it but don't see it in the sidebar.**
→ Did you add the integration after restarting? Go to **Settings → Devices & services → Add integration → Action Explorer**. The sidebar entry only appears after the integration is configured.

**Q: "No actions found for this entity domain."**
→ Some entity types are informational (sensors, binary sensors) and don't have controllable services. Try selecting a light, switch, cover, or climate entity instead.

**Q: Can I search by device name instead of entity ID?**
→ Yes! The search box searches both the friendly name and the entity ID.

**Q: Does this modify my automations?**
→ No. Action Explorer only reads state and generates YAML text for you to review. It never writes to your configuration.

**Q: Does it send data externally?**
→ No. Everything runs locally inside your Home Assistant instance. No cloud, no telemetry, no external API calls.

---

## Security model

- All API endpoints require Home Assistant authentication.
- The integration does **not** mutate Home Assistant configuration. The POST endpoint only validates the selected entity/service and returns starter YAML for you to review.
- The frontend renders user-controlled names and YAML with DOM `textContent`, not unsafe HTML interpolation.
- The integration does **not** send data outside your Home Assistant instance.

---

## Development

```bash
# Node 22+ is recommended; CI uses Node 22.
npm ci
npm run check
python -m py_compile custom_components/action_explorer/*.py
npm run screenshot
```

The built panel bundle is committed at `custom_components/action_explorer/www/action-explorer-panel.js` so HACS can install the integration without a Node build step. CI fails if the bundle drifts from `src/action-explorer-panel.js`.

---

## Why

Home Assistant's UI is good at browsing from **Action → entity** (create an automation, pick a service, then pick the target entity). It is harder for new users to answer **Entity/device → what can I do with it?** This panel makes that direction explicit.

## Current MVP

- Side panel registered at **Action Explorer**.
- Entity search powered by the Home Assistant state machine.
- Per-entity action list generated from Home Assistant's live service registry.
- Recommended/common actions ranked first for lights, switches, covers, climate, media players, fans, locks, buttons, scenes and automations.
- Starter automation YAML generated after validating that the selected entity exists and the selected service is registered.
- No cloud service, no telemetry, no external API calls.

## Limitations

- This MVP lists entity-domain services. Full device automation capabilities and integration-specific device triggers are planned.
- Generated YAML is a starter snippet, not an automatic write into `automations.yaml`.
- Service descriptions and field schemas depend on what Home Assistant exposes through the runtime service registry; some services may only show their action name and an example payload.

## Roadmap

- Device-first browsing via entity registry device IDs.
- Device triggers, conditions and actions where integrations expose them.
- Script generation alongside automation snippets.
- One-click copy buttons and import guidance.
- Optional admin-only mode to save generated automations directly.

---

*This project was developed with the assistance of AI tools.*
