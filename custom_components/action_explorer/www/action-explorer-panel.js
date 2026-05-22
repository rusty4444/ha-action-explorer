// src/utils.js
function formatFieldCount(fields = {}) {
  const count = Object.keys(fields || {}).length;
  return `${count} field${count === 1 ? "" : "s"}`;
}

// src/action-explorer-panel.js
var API_BASE = "action_explorer";
function createElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== void 0) node.textContent = String(text);
  return node;
}
var ActionExplorerPanel = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = void 0;
    this._entities = [];
    this._selected = void 0;
    this._actions = [];
    this._automationYaml = "";
    this._error = "";
    this._query = "";
    this._listEl = null;
    this._actionBodyEl = null;
    this._actionOutputEl = null;
    this._errorEl = null;
    this._built = false;
  }
  set hass(hass) {
    this._hass = hass;
    if (!this._built) {
      this._buildLayout();
      this._built = true;
      this.loadEntities();
    }
  }
  set panel(config) {
    this._panelConfig = config || {};
  }
  apiBase() {
    return this._panelConfig?.config?.apiBase || API_BASE;
  }
  _formatError(err) {
    if (err && typeof err === "object") {
      if (err.status_code) {
        let msg = `HTTP ${err.status_code}`;
        if (err.error) msg += `: ${err.error}`;
        else if (err.body) msg += `: ${typeof err.body === "object" ? JSON.stringify(err.body).slice(0, 200) : err.body}`;
        return msg;
      }
      if (err.error) return err.error;
      if (err.message) return err.message;
    }
    return String(err);
  }
  async loadEntities() {
    if (!this._hass) return;
    this._error = "";
    try {
      const params = this._query ? `?q=${encodeURIComponent(this._query)}` : "";
      const response = await this._hass.callApi("GET", `${this.apiBase()}/entities${params}`);
      this._entities = response.entities || [];
    } catch (err) {
      this._error = `Could not load entities: ${this._formatError(err)}`;
    }
    this._refresh();
  }
  async selectEntity(entityId) {
    if (!this._hass || !entityId) return;
    this._selected = entityId;
    this._automationYaml = "";
    this._error = "";
    try {
      const response = await this._hass.callApi("GET", `${this.apiBase()}/actions/${encodeURIComponent(entityId)}`);
      this._actions = response.actions || [];
    } catch (err) {
      this._actions = [];
      this._error = `Could not load actions: ${this._formatError(err)}`;
    }
    this._refresh();
  }
  async generateAutomation(action) {
    if (!this._hass || !this._selected) return;
    this._error = "";
    try {
      const response = await this._hass.callApi("POST", `${this.apiBase()}/automation`, {
        entity_id: this._selected,
        service: action.service,
        service_data: action.example_data || {},
        alias: `Run ${action.service} for ${this._selected}`
      });
      this._automationYaml = response.automation_yaml || "";
    } catch (err) {
      this._automationYaml = "";
      this._error = `Could not generate automation: ${this._formatError(err)}`;
    }
    this._refresh();
  }
  /* ---- one-time layout ---- */
  _buildLayout() {
    const style = document.createElement("style");
    style.textContent = `
      :host { display: block; min-height: 100vh; color: var(--primary-text-color, #1f2933); background: var(--primary-background-color, #f5f7fb); font-family: var(--paper-font-body1_-_font-family, system-ui, sans-serif); }
      .wrap { max-width: 1180px; margin: 0 auto; padding: 28px; }
      .hero { display: grid; gap: 8px; margin-bottom: 22px; }
      h1 { margin: 0; font-size: 34px; letter-spacing: -0.03em; }
      p { margin: 0; color: var(--secondary-text-color, #5f6b7a); }
      .grid { display: grid; grid-template-columns: minmax(260px, 360px) 1fr; gap: 18px; align-items: start; }
      .card { background: var(--card-background-color, white); border: 1px solid rgba(127,127,127,.18); border-radius: 18px; box-shadow: 0 10px 30px rgba(15,23,42,.08); overflow: hidden; }
      .section { padding: 18px; border-bottom: 1px solid rgba(127,127,127,.14); }
      .section:last-child { border-bottom: 0; }
      .search { width: 100%; box-sizing: border-box; padding: 12px 14px; border-radius: 12px; border: 1px solid rgba(127,127,127,.28); background: transparent; color: inherit; }
      .list { max-height: 62vh; overflow: auto; }
      button.entity { display: grid; gap: 4px; width: 100%; border: 0; background: transparent; color: inherit; text-align: left; padding: 13px 16px; border-bottom: 1px solid rgba(127,127,127,.10); cursor: pointer; }
      button.entity:hover, button.entity.selected { background: rgba(3,169,244,.10); }
      .entity-id, code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
      .muted { color: var(--secondary-text-color, #64748b); font-size: 13px; }
      .actions { display: grid; gap: 12px; }
      .action { display: grid; grid-template-columns: 1fr auto; gap: 12px; padding: 14px; border: 1px solid rgba(127,127,127,.16); border-radius: 14px; }
      .pill { display: inline-flex; width: fit-content; padding: 3px 8px; border-radius: 999px; font-size: 12px; background: rgba(3,169,244,.14); color: #0277bd; }
      .primary { border: 0; border-radius: 10px; background: var(--primary-color, #03a9f4); color: var(--text-primary-color, white); padding: 10px 12px; cursor: pointer; }
      pre { white-space: pre-wrap; margin: 0; padding: 16px; border-radius: 14px; background: #0f172a; color: #e2e8f0; overflow: auto; }
      .error { margin-bottom: 14px; padding: 12px 14px; border-radius: 12px; background: #fee2e2; color: #991b1b; }
      @media (max-width: 800px) { .grid { grid-template-columns: 1fr; } .wrap { padding: 16px; } }
    `;
    this.shadowRoot.append(style);
    const wrap = createElement("main", "wrap");
    const hero = createElement("section", "hero");
    hero.append(createElement("h1", "", "Action Explorer"));
    hero.append(createElement("p", "", "Pick any Home Assistant entity, inspect supported actions, then generate a validated starter automation."));
    wrap.append(hero);
    this._errorEl = createElement("div", "error");
    this._errorEl.style.display = "none";
    wrap.append(this._errorEl);
    const grid = createElement("section", "grid");
    grid.append(this._buildEntityCard());
    grid.append(this._buildActionCard());
    wrap.append(grid);
    this.shadowRoot.append(wrap);
  }
  /* ---- entity list ---- */
  _buildEntityCard() {
    const card = createElement("aside", "card");
    const searchSection = createElement("div", "section");
    const input = createElement("input", "search");
    input.placeholder = "Search entities, e.g. kitchen light";
    input.value = "";
    input.addEventListener("input", (event) => {
      this._query = event.target.value;
      clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => this.loadEntities(), 250);
    });
    searchSection.append(input);
    card.append(searchSection);
    this._listEl = createElement("div", "list");
    card.append(this._listEl);
    this._populateEntityList();
    return card;
  }
  _populateEntityList() {
    if (!this._listEl) return;
    this._listEl.textContent = "";
    if (this._error) {
      this._errorEl.textContent = this._error;
      this._errorEl.style.display = "";
    } else {
      this._errorEl.style.display = "none";
    }
    for (const entity of this._entities) {
      const button = createElement("button", `entity${entity.entity_id === this._selected ? " selected" : ""}`);
      button.type = "button";
      button.addEventListener("click", () => this.selectEntity(entity.entity_id));
      button.append(createElement("strong", "", entity.name));
      button.append(createElement("span", "entity-id muted", entity.entity_id));
      button.append(createElement("span", "muted", `${entity.domain} \xB7 ${entity.state}`));
      this._listEl.append(button);
    }
    if (!this._entities.length) {
      this._listEl.append(createElement("div", "section muted", "No entities loaded yet."));
    }
  }
  /* ---- action card ---- */
  _buildActionCard() {
    const card = createElement("section", "card");
    const header = createElement("div", "section");
    this._actionHeader = createElement("h2", "", "Select an entity");
    header.append(this._actionHeader);
    header.append(createElement("p", "", "Services are ranked with common actions first. Schema fields come from Home Assistant's service registry."));
    card.append(header);
    this._actionBodyEl = createElement("div", "section actions");
    card.append(this._actionBodyEl);
    this._actionOutputEl = createElement("div", "section");
    this._actionOutputEl.style.display = "none";
    card.append(this._actionOutputEl);
    this._populateActionCard();
    return card;
  }
  _populateActionCard() {
    if (!this._actionBodyEl || !this._actionHeader) return;
    this._actionHeader.textContent = this._selected ? `Actions for ${this._selected}` : "Select an entity";
    this._actionBodyEl.textContent = "";
    if (!this._selected) {
      this._actionBodyEl.append(createElement("p", "muted", "Choose an entity from the left to see what it can do."));
    } else if (!this._actions.length) {
      this._actionBodyEl.append(createElement("p", "muted", "No actions found for this entity domain."));
    } else {
      for (const action of this._actions) {
        const row = createElement("article", "action");
        const text = createElement("div", "");
        const title = createElement("strong", "entity-id", action.service);
        text.append(title);
        text.append(createElement("p", "muted", action.description || formatFieldCount(action.fields)));
        if (action.recommended) text.append(createElement("span", "pill", "Recommended"));
        const button = createElement("button", "primary", "Generate");
        button.type = "button";
        button.addEventListener("click", () => this.generateAutomation(action));
        row.append(text, button);
        this._actionBodyEl.append(row);
      }
    }
    if (this._automationYaml) {
      this._actionOutputEl.style.display = "";
      this._actionOutputEl.textContent = "";
      this._actionOutputEl.append(createElement("h2", "", "Starter automation YAML"));
      this._actionOutputEl.append(createElement("pre", "", this._automationYaml));
    } else {
      this._actionOutputEl.style.display = "none";
    }
  }
  /* ---- in-place refresh (no DOM replacement) ---- */
  _refresh() {
    this._populateEntityList();
    this._populateActionCard();
  }
};
if (globalThis.customElements && !customElements.get("action-explorer-panel")) {
  customElements.define("action-explorer-panel", ActionExplorerPanel);
}
export {
  createElement
};
