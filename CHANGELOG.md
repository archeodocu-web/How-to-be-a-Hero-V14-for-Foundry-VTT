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
