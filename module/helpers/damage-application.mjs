/**
 * Damage application from weapon damage rolls in the ChatLog.
 * A single targeted token is required to avoid applying damage to the wrong actor.
 */
function getMessageFromEntry(element) {
  const entry = element?.closest?.("[data-message-id]") || element;
  const messageId = entry?.dataset?.messageId;
  return messageId ? game.messages.get(messageId) : null;
}

function getDamageAmount(message) {
  if (!message) return null;

  const damageFlag = message.getFlag("howtobeahero", "damage");
  const flaggedAmount = Number(damageFlag?.amount);
  if (Number.isFinite(flaggedAmount) && flaggedAmount >= 0) return flaggedAmount;

  // Compatibility for damage rolls created through Actor.rollDamage().
  const rollFlag = message.getFlag("howtobeahero", "roll");
  if (rollFlag?.type === "damage") {
    const roll = message.rolls?.[0];
    const amount = Number(roll?.total);
    if (Number.isFinite(amount) && amount >= 0) return amount;
  }

  return null;
}

async function applyDamageFromMessage(message) {
  const damage = getDamageAmount(message);
  if (damage === null) {
    ui.notifications.warn(game.i18n.localize("HTBAH.ApplyDamageInvalidMessage"));
    return;
  }

  const targets = Array.from(game.user.targets || []).filter(token => token?.actor);
  if (targets.length === 0) {
    ui.notifications.warn(game.i18n.localize("HTBAH.ApplyDamageNoTarget"));
    return;
  }
  if (targets.length > 1) {
    ui.notifications.warn(game.i18n.localize("HTBAH.ApplyDamageOneTarget"));
    return;
  }

  const target = targets[0];
  const actor = target.actor;
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

  // Characters derive this value from equipped armor; NPCs can enter it manually.
  const armorValue = Number(actor.system?.attributes?.armor?.value ?? actor.armorData?.total ?? 0);
  const armor = Number.isFinite(armorValue) ? Math.max(0, armorValue) : 0;
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

/** Register the ChatLog context-menu entry for damage messages. */
let damageContextMenuRegistered = false;

export function registerDamageApplicationContextMenu() {
  if (damageContextMenuRegistered) return;
  damageContextMenuRegistered = true;

  Hooks.on("getChatMessageContextOptions", (_application, menuItems) => {
    menuItems.push({
      label: game.i18n.localize("HTBAH.ApplyDamage"),
      icon: "fa-solid fa-shield-heart",
      visible: element => getDamageAmount(getMessageFromEntry(element)) !== null,
      onClick: (_event, element) => {
        const message = getMessageFromEntry(element);
        return applyDamageFromMessage(message);
      }
    });
  });
}
