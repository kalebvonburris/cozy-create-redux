// Basic materials Ultimate Factory used to cover, rebuilt to the redesign.
ServerEvents.recipes((event) => {
  // Gunpowder: coal + blaze powder (blaze powder stands in for sulfur).
  event
    .custom({
      type: "create:mixing",
      ingredients: [
        { item: "minecraft:coal" },
        { item: "minecraft:coal" },
        { item: "minecraft:blaze_powder" },
      ],
      results: [{ id: "minecraft:gunpowder" }],
    })
    .id("cozy:progression/mixing/gunpowder");

  // Ice: water + salt + gunpowder (the old saltpeter cooling trick).
  event
    .custom({
      type: "create:mixing",
      ingredients: [
        { type: "neoforge:single", amount: 1000, fluid: "minecraft:water" },
        { item: "mekanism:salt" },
        { item: "minecraft:gunpowder" },
      ],
      results: [{ id: "minecraft:ice" }],
    })
    .id("cozy:progression/mixing/ice");

  // Ice -> packed ice -> blue ice, by washing. Blue ice gates basalt.
  event
    .custom({
      type: "create:splashing",
      ingredients: [{ item: "minecraft:ice" }],
      results: [{ id: "minecraft:packed_ice" }],
    })
    .id("cozy:progression/splashing/packed_ice");
  event
    .custom({
      type: "create:splashing",
      ingredients: [{ item: "minecraft:packed_ice" }],
      results: [{ id: "minecraft:blue_ice" }],
    })
    .id("cozy:progression/splashing/blue_ice");

  // Deepslate: stone pressed under heat, no lava.
  event
    .custom({
      type: "create:compacting",
      heat_requirement: "heated",
      ingredients: [{ item: "minecraft:stone" }],
      results: [{ id: "minecraft:deepslate" }],
    })
    .id("cozy:progression/compacting/deepslate");

  // Crying obsidian: haunted obsidian. Feeds the refined obsidian
  // compression shortcut.
  event
    .custom({
      type: "create:haunting",
      ingredients: [{ item: "minecraft:obsidian" }],
      results: [{ id: "minecraft:crying_obsidian" }],
    })
    .id("cozy:progression/haunting/crying_obsidian");

  // Wither skeleton skull, needed for nether stars and the wither data model.
  event
    .shapeless("minecraft:wither_skeleton_skull", [
      "minecraft:bone_meal",
      "minecraft:netherite_ingot",
      "minecraft:blackstone",
      "minecraft:blackstone",
      "minecraft:blackstone",
      "minecraft:blackstone",
      "minecraft:blackstone",
      "minecraft:blackstone",
      "minecraft:blackstone",
    ])
    .id("cozy:progression/crafting/wither_skeleton_skull");
});
