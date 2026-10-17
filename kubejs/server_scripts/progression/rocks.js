// Rocks and pebbles.
//
// Crushing a rock (millstone or crushing wheel, same output) gives 1 of its
// crushed rock; crushing that gives 2-5 of its pebbles. Crushed rocks are
// what gets sifted. Pebbles plus a seed are compacted into the next rock. 9
// pebbles recover 1 of their rock; 16 of any kind make a dust block.

// rock -> crushed rock -> pebble. Cobble has no crushed step yet: it still
// crushes straight to pebbles + gravel.
const ROCK_PEBBLES = [
  { rock: "minecraft:cobblestone", pebble: "createsifter:stone_pebble" },
  {
    rock: "minecraft:andesite",
    crushed: "kubejs:crushed_andesite",
    pebble: "createsifter:andesite_pebble",
  },
  {
    rock: "minecraft:diorite",
    crushed: "kubejs:crushed_diorite",
    pebble: "createsifter:diorite_pebble",
  },
  {
    rock: "minecraft:granite",
    crushed: "kubejs:crushed_granite",
    pebble: "createsifter:granite_pebble",
  },
  {
    rock: "minecraft:calcite",
    crushed: "kubejs:crushed_calcite",
    pebble: "createsifter:calcite_pebble",
  },
  {
    rock: "minecraft:basalt",
    crushed: "createsifter:crushed_basalt",
    pebble: "createsifter:basalt_pebble",
  },
  {
    rock: "create:limestone",
    crushed: "kubejs:crushed_limestone",
    pebble: "kubejs:limestone_pebble",
  },
  {
    rock: "create:scoria",
    crushed: "kubejs:crushed_scoria",
    pebble: "kubejs:scoria_pebble",
  },
  {
    rock: "minecraft:netherrack",
    crushed: "createsifter:crushed_netherrack",
    pebble: "kubejs:netherrack_pebble",
  },
];

// Extra outputs on top of the pebbles (on the crushed -> pebbles step).
const ROCK_EXTRAS = {
  // Cobble still breaks down to gravel.
  "minecraft:cobblestone": [{ id: "minecraft:gravel" }],
  // Early blaze powder, no fortress needed.
  "minecraft:netherrack": [{ chance: 0.01, id: "minecraft:blaze_powder" }],
};

// Pebble items Create Sifting registers that nothing here makes.
const UNUSED_PEBBLES = [
  "createsifter:blackstone_pebble",
  "createsifter:tuff_pebble",
  "createsifter:deepslate_pebble",
];

ServerEvents.tags("item", (event) => {
  ROCK_PEBBLES.forEach((r) => event.add("cozy:pebbles", r.pebble));
});

ServerEvents.recipes((event) => {
  // n copies of an ingredient, for recipes that take a stack of one thing.
  let copies = (ingredient, n) => {
    let list = [];
    for (let i = 0; i < n; i++) list.push(ingredient);
    return list;
  };

  // --- Removals -----------------------------------------------------------

  // Every existing crush or mill of these rocks (cinder flour, red sand,
  // free quartz from diorite, bone meal from calcite, Create Sifting's
  // crushed basalt and netherrack, and so on). Replaced below.
  ROCK_PEBBLES.forEach((r) => {
    ["create:crushing", "create:milling"].forEach((type) =>
      event.remove({ type: type, input: r.rock }),
    );
  });

  // Every other way to make these rocks. One route per item.
  [
    // vanilla crafting
    "minecraft:andesite",
    "minecraft:diorite",
    "minecraft:granite",
    // Create: flint pressed into rocks, soul sand smelted into scoria
    "create:compacting/andesite_from_flint",
    "create:compacting/diorite_from_flint",
    "create:compacting/granite_from_flint",
    "create:smelting/scoria",
    // Crafts & Additions: cobble mixed into netherrack
    "createaddition:mixing/netherrack",
    // Industrial Foregoing's stonework factory making rocks from cobble
    "industrialforegoing:stonework_generate/andesite",
    "industrialforegoing:stonework_generate/diorite",
    "industrialforegoing:stonework_generate/granite",
    "industrialforegoing:stonework_generate/netherrack",
    // Create Sifting's 4 pebbles -> 1 rock recovery (a near-loop; 9 below)
    "createsifter:shapeless/stone_pebble",
    "createsifter:shapeless/andesite_pebble",
    "createsifter:shapeless/diorite_pebble",
    "createsifter:shapeless/granite_pebble",
    "createsifter:shapeless/calcite_pebble",
    "createsifter:shapeless/basalt_pebble",
    "createsifter:shapeless/blackstone_pebble",
    "createsifter:shapeless/tuff_pebble",
  ].forEach((id) => event.remove({ id: id }));

  // --- Crushing -----------------------------------------------------------

  ROCK_PEBBLES.forEach((r) => {
    let name = r.rock.split(":")[1];
    let pebbles = [
      { count: 2, id: r.pebble },
      { chance: 0.5, id: r.pebble },
      { chance: 0.5, id: r.pebble },
      { chance: 0.5, id: r.pebble },
    ].concat(ROCK_EXTRAS[r.rock] || []);
    // The millstone takes at most 4 outputs. When the extras push it over,
    // the three 50% rolls become one 50% roll of 3: same 3.5 average, same
    // 2-5 range.
    let milled =
      pebbles.length > 4
        ? [
            { count: 2, id: r.pebble },
            { chance: 0.5, count: 3, id: r.pebble },
          ].concat(ROCK_EXTRAS[r.rock] || [])
        : pebbles;

    ["crushing", "milling"].forEach((type) => {
      let out = type == "milling" ? milled : pebbles;
      if (r.crushed) {
        // rock -> 1 crushed rock
        event
          .custom({
            type: "create:" + type,
            ingredients: [{ item: r.rock }],
            processing_time: 250,
            results: [{ id: r.crushed }],
          })
          .id("cozy:progression/" + type + "/" + name);
        // crushed rock -> pebbles
        event
          .custom({
            type: "create:" + type,
            ingredients: [{ item: r.crushed }],
            processing_time: 250,
            results: out,
          })
          .id("cozy:progression/" + type + "/crushed_" + name);
      } else {
        event
          .custom({
            type: "create:" + type,
            ingredients: [{ item: r.rock }],
            processing_time: 250,
            results: out,
          })
          .id("cozy:progression/" + type + "/" + name);
      }
    });

    // Recovery: 9 pebbles back into their rock.
    event
      .shapeless(r.rock, copies(r.pebble, 9))
      .id("cozy:progression/crafting/" + name + "_from_pebbles");
  });

  // --- Intermediate rocks: 6 pebbles + 2 seed, compacted ------------------

  let rock = (output, ingredients) => {
    event
      .custom({
        type: "create:compacting",
        ingredients: ingredients,
        results: [{ id: output }],
      })
      .id("cozy:progression/compacting/" + output.split(":")[1]);
  };
  let items = (id, n) => copies({ item: id }, n);

  rock(
    "minecraft:andesite",
    items("createsifter:stone_pebble", 6).concat(
      items("createsifter:raw_iron_piece", 2),
    ),
  );
  rock(
    "minecraft:calcite",
    items("createsifter:stone_pebble", 6).concat(
      items("minecraft:bone_meal", 2),
    ),
  );
  rock(
    "minecraft:diorite",
    items("createsifter:andesite_pebble", 3)
      .concat(items("createsifter:basalt_pebble", 3))
      .concat(items("minecraft:calcite", 2)),
  );
  rock(
    "minecraft:granite",
    items("createsifter:diorite_pebble", 6).concat(
      items("minecraft:quartz", 2),
    ),
  );
  // Sedimentary: calcite settled out of water and pressed.
  rock(
    "create:limestone",
    items("createsifter:calcite_pebble", 8).concat([
      { type: "neoforge:single", amount: 250, fluid: "minecraft:water" },
    ]),
  );
  // Volcanic: basalt and cobble, seeded with netherrack.
  rock(
    "create:scoria",
    items("createsifter:basalt_pebble", 3)
      .concat(items("createsifter:stone_pebble", 3))
      .concat(items("kubejs:netherrack_pebble", 2)),
  );

  // --- Dust ---------------------------------------------------------------

  // The sink for every line's surplus pebbles.
  event
    .custom({
      type: "create:compacting",
      ingredients: copies({ tag: "cozy:pebbles" }, 16),
      results: [{ id: "createsifter:dust" }],
    })
    .id("cozy:progression/compacting/dust_from_pebbles");

  // Lava without blaze cake: heated dust. Superheated cobble is the main
  // route (Create's own, 50 mB per cobble).
  event
    .custom({
      type: "create:mixing",
      heat_requirement: "heated",
      ingredients: [{ item: "createsifter:dust" }],
      results: [{ amount: 50, id: "minecraft:lava" }],
    })
    .id("cozy:progression/mixing/lava_from_dust");

  // Netherrack pebbles mill into cinder flour (for blaze cakes), now that
  // crushing netherrack gives pebbles instead.
  event
    .custom({
      type: "create:milling",
      ingredients: [{ item: "kubejs:netherrack_pebble" }],
      processing_time: 100,
      results: [{ id: "create:cinder_flour" }],
    })
    .id("cozy:progression/milling/cinder_flour");
});

RecipeViewerEvents.removeEntries("item", (event) => {
  UNUSED_PEBBLES.forEach((id) => event.remove(id));
});
