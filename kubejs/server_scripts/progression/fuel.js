// Coal and diamonds from the organic line.
ServerEvents.recipes((event) => {
  // Early coal: 3 charcoal, heated and pressed.
  event
    .custom({
      type: "create:compacting",
      heat_requirement: "heated",
      ingredients: [
        { item: "minecraft:charcoal" },
        { item: "minecraft:charcoal" },
        { item: "minecraft:charcoal" },
      ],
      results: [{ id: "minecraft:coal" }],
    })
    .id("cozy:progression/compacting/coal_from_charcoal");

  // Main coal: Mekanism bio fuel, 1:1. Heat and pressure with no oxygen,
  // like real coalification. Any farm feeds it.
  event
    .custom({
      type: "create:compacting",
      heat_requirement: "heated",
      ingredients: [{ item: "mekanism:bio_fuel" }],
      results: [{ id: "minecraft:coal" }],
    })
    .id("cozy:progression/compacting/coal_from_bio_fuel");

  // Diamond: one coal or charcoal block, superheated and pressed.
  event
    .custom({
      type: "create:compacting",
      heat_requirement: "superheated",
      ingredients: [
        {
          type: "neoforge:compound",
          ingredients: [
            { item: "minecraft:coal_block" },
            { item: "mekanism:block_charcoal" },
          ],
        },
      ],
      results: [{ id: "minecraft:diamond" }],
    })
    .id("cozy:progression/compacting/diamond");
});
