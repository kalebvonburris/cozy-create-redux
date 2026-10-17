// Netherrack and blaze, without a fortress.
// cobble -(haunting, Create)-> blackstone -(haunting)-> netherrack
ServerEvents.recipes((event) => {
  event
    .custom({
      type: "create:haunting",
      ingredients: [{ item: "minecraft:blackstone" }],
      results: [{ id: "minecraft:netherrack" }],
    })
    .id("cozy:progression/haunting/netherrack");

  // 6 blaze powder -> 1 blaze rod.
  event
    .custom({
      type: "create:compacting",
      ingredients: [
        { item: "minecraft:blaze_powder" },
        { item: "minecraft:blaze_powder" },
        { item: "minecraft:blaze_powder" },
        { item: "minecraft:blaze_powder" },
        { item: "minecraft:blaze_powder" },
        { item: "minecraft:blaze_powder" },
      ],
      results: [{ id: "minecraft:blaze_rod" }],
    })
    .id("cozy:progression/compacting/blaze_rod");

  // Second blaze burner recipe: feed an empty burner 8 rods instead of a
  // live blaze.
  event
    .shaped("create:blaze_burner", ["RRR", "RBR", "RRR"], {
      R: "minecraft:blaze_rod",
      B: "create:empty_blaze_burner",
    })
    .id("cozy:progression/crafting/blaze_burner_from_rods");

  // Advanced blaze powder: sulfur + coal, heated.
  event
    .custom({
      type: "create:mixing",
      heat_requirement: "heated",
      ingredients: [
        { tag: "c:dusts/sulfur" },
        { item: "minecraft:coal" },
      ],
      results: [{ count: 2, id: "minecraft:blaze_powder" }],
    })
    .id("cozy:progression/mixing/blaze_powder");
});
