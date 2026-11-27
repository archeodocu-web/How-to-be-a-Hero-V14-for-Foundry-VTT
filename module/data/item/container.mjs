import HowToBeAHeroPhysical from "./physical.mjs";

/**
 * A physical inventory container (e.g. a suitcase or backpack).
 * Its contents remain normal Actor Items and reference this Item via system.containerId.
 */
export default class HowToBeAHeroContainer extends HowToBeAHeroPhysical {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
    // Each Koffer has its own nested inventory and therefore represents one
    // unique container document rather than a stack of interchangeable bags.
    schema.quantity = new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 1,
      min: 1,
      max: 1
    });
    return schema;
  }
}
