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
      ingredients: [{ tag: "c:dusts/sulfur" }, { item: "minecraft:coal" }],
      results: [{ count: 2, id: "minecraft:blaze_powder" }],
    })
    .id("cozy:progression/mixing/blaze_powder");

  // Netherite scrap: 8 netherrack pebbles + 1 diamond, superheated and
  // pressed. No sifted netherite.
  let scrapIngredients = [];
  for (let i = 0; i < 8; i++)
    scrapIngredients.push({ item: "kubejs:netherrack_pebble" });
  scrapIngredients.push({ item: "minecraft:diamond" });
  event
    .custom({
      type: "create:compacting",
      heat_requirement: "superheated",
      ingredients: scrapIngredients,
      results: [{ id: "minecraft:netherite_scrap" }],
    })
    .id("cozy:progression/compacting/netherite_scrap");

  // Glowstone block: 4 netherrack + 4 scoria pebbles + 1 redstone, pressed.
  // Dust comes from Create's own glowstone crushing (3 + 50% 1).
  let glowIngredients = [];
  for (let i = 0; i < 4; i++)
    glowIngredients.push({ item: "kubejs:netherrack_pebble" });
  for (let i = 0; i < 4; i++)
    glowIngredients.push({ item: "kubejs:scoria_pebble" });
  glowIngredients.push({ item: "minecraft:redstone" });
  event
    .custom({
      type: "create:compacting",
      ingredients: glowIngredients,
      results: [{ id: "minecraft:glowstone" }],
    })
    .id("cozy:progression/compacting/glowstone");

  // Create's cinder flour + potion fillings. Glowstone and redstone have
  // their own routes.
  event.remove({ id: "create:filling/glowstone" });
  event.remove({ id: "create:filling/redstone" });
});
