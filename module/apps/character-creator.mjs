/**
 * Opens the original How to be a Hero character creator inside Foundry.
 * The creator is hosted on GitHub Pages and runs in an iframe so its
 * original step-by-step workflow is preserved without opening a new tab.
 *
 * Note: the upstream creator currently produces its own character overview;
 * it does not expose a documented Foundry Actor import format/API.
 */
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class HowToBeAHeroCharacterCreator extends HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  static CREATOR_URL = "https://razzeee.github.io/htbah-character-creator/";

  static DEFAULT_OPTIONS = {
    classes: ["how-to-be-a-hero", "htbah-character-creator-window"],
    tag: "section",
    position: {
      width: 1120,
      height: 820
    },
    window: {
      title: "HTBAH.CharacterCreator.Title",
      resizable: true,
      minimizable: true,
      controls: []
    },
    actions: {
      openExternal: HowToBeAHeroCharacterCreator.prototype._onOpenExternal
    }
  };

  static PARTS = {
    main: {
      template: "systems/how-to-be-a-hero/templates/apps/character-creator.hbs"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.creatorUrl = HowToBeAHeroCharacterCreator.CREATOR_URL;
    return context;
  }

  /** Open the upstream creator in the user's browser as an iframe fallback. */
  _onOpenExternal(event, target) {
    event.preventDefault();
    window.open(HowToBeAHeroCharacterCreator.CREATOR_URL, "_blank", "noopener,noreferrer");
  }

  /** @override */
  async _onRender(context, options) {
    super._onRender(context, options);
    const frame = this.element.querySelector("iframe.htbah-character-creator-frame");
    if (frame) {
      frame.addEventListener("load", () => {
        frame.dataset.loaded = "true";
      }, { once: true });
    }
  }
}
