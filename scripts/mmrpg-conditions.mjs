
const MODULE_ID = "marvel-multiverse-conditions-hud";
let CONDITION_DATA = null;

/** Install our Marvel condition list into CONFIG.statusEffects */
async function installConditions() {
  if (CONDITION_DATA) return CONDITION_DATA;
  const url = `modules/${MODULE_ID}/data/conditions.json`;
  CONDITION_DATA = await fetch(url).then((r) => r.json());
  const sorted = [...(CONDITION_DATA.conditions || [])].sort((a,b)=> (a.name||"").localeCompare(b.name||"", navigator.language||"pt-BR", {sensitivity:"base"}));
  const list = sorted.map((c) => ({
    id: c.id,
    name: c.name,
    label: c.name,
    img: `/modules/${MODULE_ID}/${c.icon}`,
    icon: `/modules/${MODULE_ID}/${c.icon}` // compat v12/v13
  }));
  CONFIG.statusEffects = list;
  console.log(`[${MODULE_ID}] Installed ${list.length} Marvel conditions into CONFIG.statusEffects.`);
  return CONDITION_DATA;
}

/** Top tray to show active conditions on selected token */
class ConditionTray {
  constructor() {
    this.element = null;
    Hooks.on("controlToken", () => this.render());
    Hooks.on("updateActor", () => this.render());
    Hooks.on("createActiveEffect", () => this.render());
    Hooks.on("deleteActiveEffect", () => this.render());
    Hooks.on("updateToken", () => this.render());
    Hooks.on("canvasReady", () => { this.observeSidebarTabs(); this.observeSidebarWidth(); this.render(); });
    window.addEventListener("resize", () => this.positionTrayNearChat());
  }

  get selectedActor() {
    return canvas?.tokens?.controlled?.[0]?.actor ?? null;
  }

  observeSidebarTabs() {
    if (this._sidebarTabsObserver) return;
    const tabs = document.getElementById("sidebar-tabs");
    if (!tabs) return;
    this._sidebarTabsObserver = new MutationObserver(() => this.positionTrayNearChat());
    this._sidebarTabsObserver.observe(tabs, { attributes: true, childList: true, subtree: true });
  }

  observeSidebarWidth() {
    if (this._sidebarWidthObserver) return;
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;
    this._sidebarWidthObserver = new ResizeObserver(() => this.positionTrayNearChat());
    this._sidebarWidthObserver.observe(sidebar);
  }

  positionTrayNearChat() {
    const tray = document.getElementById("mmrpg-condition-tray");
    if (!tray) return;
    const offX = Number(game.settings.get(MODULE_ID, "offsetX") ?? 12);
    const offY = Number(game.settings.get(MODULE_ID, "offsetY") ?? 6);
    const sidebar = document.getElementById("sidebar");
    const tabs = document.getElementById("sidebar-tabs");

    // vertical: alinhar ao topo dos tabs (ícone de chat)
    let top = 10;
    if (tabs) {
      const rt = tabs.getBoundingClientRect();
      top = Math.max(8, rt.top + offY);
    }
    tray.style.top = `${top}px`;
    tray.style.left = "";
    tray.style.bottom = "";
    // horizontal: encostar à esquerda da sidebar usando right = largura atual + offset
    const width = sidebar ? sidebar.getBoundingClientRect().width : 0;
    tray.style.right = `${Math.max(8, width + offX)}px`;
  }

  async render() {
    await installConditions();
    // Ensure container exists
    let tray = document.getElementById("mmrpg-condition-tray");
    if (!tray) {
      tray = document.createElement("div");
      tray.id = "mmrpg-condition-tray";
      document.body.appendChild(tray);
    }
    tray.innerHTML = "";

    const actor = this.selectedActor;
    if (!actor) { this.positionTrayNearChat(); return; }

    // Collect statuses from actor
    const statuses = Array.from(actor?.statuses ?? []);
    const byId = Object.fromEntries((CONDITION_DATA.conditions || []).map(c => [c.id, c]));

    for (const sid of statuses) {
      const c = byId[sid];
      if (!c) continue;
      const pill = document.createElement("div");
      pill.className = "mmrpg-cond-pill";
      pill.innerHTML = `
        <img src="/modules/${MODULE_ID}/${c.icon}" />
        <span class="name">${c.name}</span>
        ${game.user?.isGM ? `<button class="mmrpg-cond-remove" title="Remover (GM)">×</button>` : ``}
        <div class="mmrpg-cond-tooltip">
          <div style="font-weight:700;margin-bottom:6px;">${c.name}</div>
          <div>${c.description ?? ""}</div>
          ${c.remove ? `<hr style="opacity:.2;margin:8px 0;"><div><b>Como remover:</b> ${c.remove}</div>` : ""}
        </div>
      `;
      tray.appendChild(pill);

      if (game.user?.isGM) {
        const btn = pill.querySelector(".mmrpg-cond-remove");
        if (btn) btn.addEventListener("click", (ev) => {
          ev.stopPropagation();
          this.removeCondition(c.id).then(() => setTimeout(() => this.render(), 50));
        });
      }
    }
    this.positionTrayNearChat();
  }

  async removeCondition(condId) {
    const token = canvas?.tokens?.controlled?.[0];
    const actor = token?.actor;
    if (!actor || !game.user?.isGM) return;
    try {
      if (token?.document?.toggleStatusEffect) {
        await token.document.toggleStatusEffect(condId, { active: false });
        return;
      }
    } catch (e) {}
    try {
      if (token?.toggleStatusEffect) {
        await token.toggleStatusEffect(condId, { active: false });
        return;
      }
    } catch (e) {}
    try {
      if (actor?.toggleStatusEffect) {
        await actor.toggleStatusEffect(condId, { active: false });
        return;
      }
    } catch (e) {}
    try {
      const toDelete = actor.effects.filter(e => e.statuses?.has?.(condId)).map(e => e.id);
      if (toDelete.length) await actor.deleteEmbeddedDocuments("ActiveEffect", toDelete);
    } catch (e) {
      console.error(`[${MODULE_ID}] Falha ao remover status '${condId}'.`, e);
    }
  }
}

const tray = new ConditionTray();

/** Settings */
function registerSettings() {
  game.settings.register(MODULE_ID, "autoTurnDamage", {
    name: "Aplicar dano de condições automaticamente no fim do turno",
    scope: "world", config: true, type: Boolean, default: true
  });
  game.settings.register(MODULE_ID, "offsetX", { name: "Offset X do painel", scope: "client", config: true, type: Number, default: 12 });
  game.settings.register(MODULE_ID, "offsetY", { name: "Offset Y do painel", scope: "client", config: true, type: Number, default: 6 });
}

/** End-of-turn damage for ongoing conditions (Ablaze/Bleeding/Corroding) */
async function applyEndTurnDamage(combat, previous) {
  if (!game.settings.get(MODULE_ID, "autoTurnDamage")) return;
  try {
    const prev = previous ?? { turn: combat?.previous?.turn };
    const ended = combat?.turns?.[prev.turn];
    if (!ended) return;
    const token = canvas.tokens.get(ended.tokenId);
    const actor = token?.actor;
    if (!actor) return;

    await installConditions();
    const ongoing = ["mmrpg.ablaze", "mmrpg.bleeding", "mmrpg.corroding"];
    const active = ongoing.filter(s => actor.hasStatusEffect(s));
    if (active.length === 0) return;

    const perTurn = 5 * active.length;
    const drLevels = Number(getProperty(actor, "system.healthDamageReduction")) || 0;
    const reduced = Math.max(0, perTurn - (drLevels * 5));
    if (reduced <= 0) return;

    const current = Number(getProperty(actor, "system.health.value")) || 0;
    const newValue = Math.max(0, current - reduced);
    await actor.update({ "system.health.value": newValue });

    const list = active.map(a => a.split(".")[1]).join(", ");
    const content = `<p><b>${actor.name}</b> sofre <b>${reduced}</b> de dano de condição (${list}). <small>(Reduzido por Sturdy: ${drLevels * 5})</small></p>`;
    ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor }), content });
  } catch (err) {
    console.error(`[${MODULE_ID}] Error applying end-of-turn damage`, err);
  }
}

// Core + hooks
Hooks.once("init", async () => {
  registerSettings();
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `modules/${MODULE_ID}/styles/styles.css`;
  document.head.appendChild(link);
});

Hooks.once("ready", async () => {
  await installConditions();

  // Try to force Core to 'custom' status effects; fallback to monkeypatch
  try {
    const key = "core.statusEffectType";
    const current = game.settings.get("core", "statusEffectType");
    if (game.user?.isGM && current !== "custom") {
      await game.settings.set("core", "statusEffectType", "custom");
      ui.notifications?.info("Marvel Multiverse – Conditions HUD: modo 'Ícones de Efeitos' definido para 'Personalizado'.");
    }
  } catch (e) {
    console.warn(`[${MODULE_ID}] Não consegui alternar 'statusEffectType' para 'custom'. Aplicando fallback no TokenHUD.`);
  }

  // Fallback: garantir que o HUD use nossa lista
  const Klass = foundry.applications?.hud?.TokenHUD ?? TokenHUD;
  if (Klass) {
    const original = Klass.prototype._getStatusEffectChoices;
    Klass.prototype._getStatusEffectChoices = function(...args) {
      const list = CONFIG.statusEffects ?? [];
      return list.map(e => ({ id: e.id, title: (e.label ?? e.name ?? e.id), src: (e.img ?? e.icon), tint: null }));
    };
    console.log(`[${MODULE_ID}] TokenHUD._getStatusEffectChoices sobrescrito para usar CONFIG.statusEffects.`);
  }

  tray.render();
  tray.observeSidebarTabs();
  tray.observeSidebarWidth();
});

// Ensure tooltip titles inside HUD use friendly names
Hooks.on("renderTokenHUD", async (app, html, data) => {
  try {
    await installConditions();
    const map = {};
    for (const c of (CONDITION_DATA.conditions || [])) map[c.id] = c.name;
    const root = (html?.jquery ? html[0] : (html instanceof HTMLElement ? html : (app?.element?.[0] ?? app?.element ?? null)));
    if (!root) return;
    root.querySelectorAll(".status-effects .effect-control").forEach((el) => {
      const sid = el?.dataset?.statusId;
      if (!sid) return;
      const friendly = map[sid];
      if (friendly) {
        el.removeAttribute("title");
      el.dataset.tooltip = friendly;
      }
    });
  } catch (e) {
    console.warn(`[${MODULE_ID}] renderTokenHUD title patch failed`, e);
  }
});

// Combat hooks
Hooks.on("combatTurn", (combat, turn) => applyEndTurnDamage(combat, { turn }));
Hooks.on("updateCombat", (combat, changed) => {
  if ("turn" in changed) applyEndTurnDamage(combat, { turn: changed.turn - 1 });
});
