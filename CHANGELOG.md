## [1.1.19] - 2026-11-21

### Changed
- Removed the Uses column and per-item uses counter from the character inventory; item quantity is now the single visible stock control.
- Kept the underlying uses data model and tool-sheet settings for backward compatibility with existing items.
- Rebalanced inventory column styling and responsive rules after removing Uses.

## [1.1.18] - 2026-11-21

### Fixed
- Render the Use action as a normal inline control inside every individual magic ability card.
- Removed the global `gold-button` class from the per-ability Use button so it no longer inherits fixed bottom-right positioning intended for the floating create button.
- Kept the floating plus/create button unchanged.

## 1.1.14
- Added the existing SVG icon gallery to item editing sheets so players can replace or reset an item icon.
- Embedded item editing now explicitly follows parent Actor ownership; GM rights are not required for an owned character inventory.
- Shared the SVG icon catalog between item creation and editing.

- Replaced deprecated core.rollMode access with Foundry V14 core.messageMode and ChatMessage.applyMode, retaining a V13 fallback.
## 1.1.11
- Modern renderChatMessageHTML + public ContextMenu registration.
- Correct system ChatMessage flag scope.

## 1.1.10
- Reworked the damage context action to use the ChatLog's documented `data-message-id` row element directly, matching the V13/V14 ChatMessage context-menu pattern.
- Added a compatibility fallback that reads damage from existing HTBAH weapon-card content when older messages lack damage flags.
- Removed the fragile WeakMap/DOM wrapper lookup that could hide the context-menu item when the callback received the outer ChatLog row.

## 1.1.9
- Fix: register the Apply Damage chat context action at module load, before the ChatLog creates its context menu.
- Fix: bind rendered chat message elements to their ChatMessage documents for reliable context-menu lookup.
- Feature: snapshot the targeted actor UUIDs into weapon damage messages and apply damage to the target of that attack.
- Fix: use calculated equipped armor values as well as manually stored armor values when reducing damage.

## 1.1.8
- Corrected the Combat Tracker initiative formula to use the same derived Action modifier as character-sheet initiative rolls.
- Registered the armor-aware chat damage action during system initialization so it is available when the ChatLog constructs its context menu.
- Updated the ChatMessage context-menu entry to the Foundry V13/V14 ContextMenuEntry API (`label`, `visible`, and `onClick`).

## 1.1.7
- Added a ChatLog context-menu action to apply rolled damage to one targeted actor after subtracting that actor's armor value.
- Added confirmation showing rolled damage, armor reduction, final damage, and remaining hit points.
- Stored final damage totals in chat message flags for weapon rolls and Actor.rollDamage rolls.

# Changelog

## 1.1.6
- Compact/combat mode keeps clickable Handeln, Wissen and Soziales roll buttons visible.
- Weapon items are rollable by default and open the damage roll dialog from the header shortcut.
- Inventory SVGs render as light silhouettes instead of black-on-black images.
- Context menus and roll-dialog labels use localized text instead of raw HTBAH translation keys.

## 1.1.4
- Added missing localization aliases and item creation dialog translations.
- Improved responsive character sheet sizing and typography.
- Fixed inventory heading spacing and responsive item picker layout.

# CHANGELOG

## 0.5.0
- renamed talents to skill set (#26)
- update licence to CC BY-NC-SA 4.0 (#19)
- switch _action_ and _knowledge_ skill set to allign with official character sheet (#25)
- Removed unlicenced Dungeons and Dragons Artworks (#36)
- Renamed _baseattributes_ to _attributes_ on actor data (#27)
- Added dice icons to rollable items and optimized css in chatcard presentation 
- Removed Homebrew Inspiration points, as this should be a module (#40)
- Reanmed _skill_ to _ability_ in internal data structure
- Refactor Action, Knowledge and Social into single Ability Item Type (#22)

## 1.0.0
- AppV2 migration completed
- add credits for icons
- update roll functionalities
- v13+ ready
- add optional mana-bar
- extensive upgrade for drag&drop functionalities for items
- add compact-combat mode
- add parry functionality
- extensive css updates for actor- and item-sheets

## 1.0.1
- Hotfix for discovered minor bugs in character sheet (#78)

## 1.1.0
- Release final version for Foundry 13 (v13.351)


## 1.1.5
- Fixed untranslated HTBAH labels with case-insensitive lookup and clean localized fallbacks.
- Added German labels for new Action, Knowledge, and Social entries.
- Restored the character sheet's external tab navigation by allowing window-content overflow.
- Resized the initiative/header area as a responsive four-column grid so all four slots remain visible.

## [1.1.13] - 2026-11-21

### Fixed
- Removed the separate Foundry ContextMenu instance from damage application, avoiding its failing close-animation lifecycle.
- Bound the damage action directly to each ChatMessage HTMLElement supplied by `renderChatMessageHTML`.
- Added a native HTML right-click menu for damage messages. The damage action does not use `getChatMessageContextOptions`, the Foundry `ContextMenu` class, or the deprecated `renderChatMessage` hook.
- Added localized error feedback if applying damage fails.


## [1.1.15] - 2026-11-21

### Added
- 80 additional original monochrome SVG item silhouettes across the existing weapon, consumable, armor, tool, and item types.
- Search fields in the item creation and item editing icon galleries.
- Local SVG assets; no runtime network dependency.

### Unchanged
- Existing five Item document types and existing inventory layout.
- Existing damage application, chat context action, and combat logic.


## [1.1.16] - 2026-11-21

### Fixed
- Item sheets can be resized again; removed fixed 570x450 pixel min/max dimensions.
- The item header icon opens the system SVG gallery instead of the Foundry file browser.
- Added a separate image-file picker action to preserve normal Item image editing.
- Replaced the narrow inline SVG list with a larger searchable gallery dialog for existing Items.
- Improved item sheet flex sizing and typography space at different window sizes.

### Changed
- Simplified consumable SVG choices to broad categories: potion, vial, food, poison, medicine, and bandage.
- Old consumable SVG files remain in the package so previously assigned icon paths continue to work.
- Weapon, armor, tool, and general item icon catalogs remain unchanged.


## [1.1.17] - 2026-11-21

### Added
- Added a dedicated Magic tab to character sheets with a character-owned magic ability list and Mana pool display.
- Added a separate `magic` Item type with configurable mana cost, optional roll, and optional armor effect.
- Added a local monochrome SVG library for elemental and general magical abilities.
- Added chat-message actions to deduct mana from the caster and apply configured magic effects to the T-targeted Actor.
- Added round-based armor effects using Foundry ActiveEffect duration tracking; duration 0 is indefinite until manually removed.
- Added ten local monochrome magic SVGs for fire, water, air, earth, aether, protection, healing, illusion, telekinesis, and summoning.

### Changed
- Extended calculated armor to include active magical armor bonuses without overwriting the character's base armor attribute; manual NPC armor is also retained beneath temporary bonuses.
- Magic effects require exactly one T-targeted character when the ability is used, and the target snapshot is stored with the ChatMessage.
- Optional magic rolls include their configured roll bonus and show the captured target in the ChatMessage.
- Added the Magic tab's plus-button flow while leaving the five existing inventory item types unchanged.
- The Effects tab displays the ActiveEffect's remaining duration label.
