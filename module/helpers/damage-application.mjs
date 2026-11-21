/**
 * Apply weapon damage from a ChatLog message to the token targeted when the
 * attack was rolled (falling back to currently targeted tokens for older rolls).
 */
const renderedChatMessages = new WeakMap();
let damageContextMenuRegistered = false;

function getMessageFromEntry(element) {
  if (!element) return null;

  const candidates = [];
  if (typeof element.closest === "function") {
    const closest = element.closest("[data-message-id], .chat-message, .message");
    if (closest) candidates.push(closest);
  }
  candidates.push(element);

  for (const candidate of candidates) {
    const renderedMessage = renderedChatMessages.get(candidate);
    if (renderedMessage) return renderedMessage;

    const messageId = candidate.dataset?.messageId
      || candidate.getAttribute?.("data-message-id")
      || candidate.dataset?.messageid;
    if (messageId) {
      const message = game.messages.get(messageId);
      if (message) return message;
    }
  }

  return null;
}

function getDamageAmount(message) {
  if (!message) return null;

  const damageFlag = message.getFlag("howtobeahero", "damage");
  const flaggedAmount = Number(damageFlag?.amount);
  if (damageFlag?.amount !== undefined && Number.isFinite(flaggedAmount) && flaggedAmount >= 0) {
    return flaggedAmount;
  }

  // Compatibility for damage rolls created through Actor.rollDamage().
  const rollFlag = message.getFlag("howtobeahero", "roll");
  if (rollFlag?.type === "damage") {
    const roll = message.rolls?.[0];
    const amount = Number(roll?.total);
    if (Number.isFinite(amount) && amount >= 0) return amount;
  }

  return null;
}

function getStoredTargetActorUuids(message) {
  const damageFlag = message?.getFlag("howtobeahero", "damage");
  const rollFlag = message?.getFlag("howtobeahero", "roll");
  const uuids = damageFlag?.targetActorUuids ?? rollFlag?.data?.targetActorUuids;
  return Array.isArray(uuids) ? [...new Set(uuids.filter(uuid => typeof uuid === "string" && uuid.length))] : [];
}

async function getTargetActors(message) {
  const storedUuids = getStoredTargetActorUuids(message);

  // Prefer the target snapshot saved when the damage roll was created.
  if (storedUuids.length) {
    const documents = await Promise.all(storedUuids.map(async uuid => {
      try {
        return await fromUuid(uuid);
      } catch (error) {
        console.warn(`HowToBeAHero | Could not resolve saved damage target ${uuid}`, error);
        return null;
      }
    }));
    return [...new Map(documents.filter(document => document?.documentName === "Actor")
      .map(actor => [actor.uuid, actor])).values()];
  }

  // Compatibility for older damage messages which predate target snapshots.
  const currentlyTargetedActors = Array.from(game.user.targets || [])
    .map(token => token?.actor)
    .filter(Boolean);
  return [...new Map(currentlyTargetedActors.map(actor => [actor.uuid, actor])).values()];
}

async function applyDamageFromMessage(message) {
  const damage = getDamageAmount(message);
  if (damage === null) {
    ui.notifications.warn(game.i18n.localize("HTBAH.ApplyDamageInvalidMessage"));
    return;
  }

  const targets = await getTargetActors(message);
  if (targets.length === 0) {
    ui.notifications.warn(game.i18n.localize("HTBAH.ApplyDamageNoTarget"));
    return;
  }
  if (targets.length > 1) {
    ui.notifications.warn(game.i18n.localize("HTBAH.ApplyDamageOneTarget"));
    return;
  }

  const actor = targets[0];
  if (!game.user.isGM && !actor.isOwner) {
    ui.notifications.warn(game.i18n.localize("HTBAH.ApplyDamageNoPermission"));
    return;
  }

  const health = actor.system?.attributes?.health;
  const currentHP = Number(health?.value);
  if (!Number.isFinite(currentHP)) {
    ui.notifications.error(game.i18n.localize("HTBAH.ApplyDamageNoHealth"));
    return;
  }

  // Character armor is calculated from equipped armor items; NPC armor can
  // also be entered directly in system.attributes.armor.value. Use whichever
  // populated value is higher so the default zero field does not mask armorData.
  const calculatedArmor = Number(actor.armorData?.total);
  const storedArmor = Number(actor.system?.attributes?.armor?.value);
  const armor = Math.max(
    0,
    Number.isFinite(calculatedArmor) ? calculatedArmor : 0,
    Number.isFinite(storedArmor) ? storedArmor : 0
  );

  const rawDamage = Math.max(0, Math.round(damage));
  const appliedDamage = Math.max(0, rawDamage - armor);
  const newHP = Math.max(0, currentHP - appliedDamage);
  const escapedActorName = Handlebars.escapeExpression(actor.name);
  const escapedSource = Handlebars.escapeExpression(message.flavor || game.i18n.localize("HTBAH.Damage"));

  const confirmed = await foundry.applications.api.DialogV2.confirm({
    window: { title: game.i18n.localize("HTBAH.ApplyDamageTitle") },
    content: `
      <p><strong>${escapedActorName}</strong></p>
      <p>${game.i18n.localize("HTBAH.ApplyDamageIncoming")}: <strong>${rawDamage}</strong></p>
      <p>${game.i18n.localize("HTBAH.ApplyDamageArmor")}: <strong>${armor}</strong></p>
      <hr>
      <p>${game.i18n.localize("HTBAH.ApplyDamageFinal")}: <strong>${appliedDamage}</strong></p>
      <p>${game.i18n.localize("HTBAH.ApplyDamageHealth")}: ${currentHP} → <strong>${newHP}</strong></p>
      <small>${escapedSource}</small>
    `,
    yes: { label: game.i18n.localize("HTBAH.ApplyDamageConfirm") },
    no: { label: game.i18n.localize("HTBAH.Cancel") },
    rejectClose: false
  });

  if (confirmed !== true) return;

  await actor.update({ "system.attributes.health.value": newHP });
  ui.notifications.info(game.i18n.format("HTBAH.ApplyDamageSuccess", {
    actor: actor.name,
    damage: appliedDamage,
    hp: newHP
  }));
}

/**
 * Register the chat context-menu entry before the ChatLog's first render.
 * The render hook also binds the ChatMessage document to its DOM element so
 * context-menu callbacks do not depend on a particular chat template shape.
 */
export function registerDamageApplicationContextMenu() {
  if (damageContextMenuRegistered) return;
  if (!globalThis.Hooks?.on) {
    console.error("HowToBeAHero | Hooks API is unavailable; damage context menu was not registered.");
    return;
  }

  damageContextMenuRegistered = true;

  Hooks.on("renderChatMessageHTML", (message, html) => {
    const root = html instanceof HTMLElement ? html : html?.[0];
    if (!(root instanceof HTMLElement) || !message) return;

    root.dataset.messageId = message.id;
    renderedChatMessages.set(root, message);
    if (getDamageAmount(message) !== null) {
      root.dataset.htbahDamageMessage = "true";
    } else {
      delete root.dataset.htbahDamageMessage;
    }
  });

  Hooks.on("getChatMessageContextOptions", (_application, menuItems) => {
    if (!Array.isArray(menuItems)) {
      console.warn("HowToBeAHero | Chat message context hook did not provide a menu item array.");
      return;
    }

    // Avoid duplicate entries if the hook is re-fired by a popout ChatLog.
    if (menuItems.some(entry => entry.classes?.split?.(" ").includes("htbah-apply-damage"))) return;

    menuItems.push({
      label: game.i18n.localize("HTBAH.ApplyDamage"),
      icon: "fa-solid fa-shield-heart",
      classes: "htbah-apply-damage",
      visible: target => {
        const message = getMessageFromEntry(target);
        return message ? getDamageAmount(message) !== null
          : target?.closest?.('[data-htbah-damage-message="true"]') !== null;
      },
      onClick: async (_event, target) => {
        const message = getMessageFromEntry(target);
        if (!message) {
          ui.notifications.warn(game.i18n.localize("HTBAH.ApplyDamageInvalidMessage"));
          console.warn("HowToBeAHero | Could not resolve the ChatMessage for the damage context action.", target);
          return;
        }
        return applyDamageFromMessage(message);
      }
    });

    console.debug("HowToBeAHero | Registered Apply Damage chat context entry.");
  });

  console.info("HowToBeAHero | Damage chat context hooks registered.");
}
