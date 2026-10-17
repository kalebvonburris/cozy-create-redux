// Ore stones and the vein route.
//
// 8 rock pebbles + a catalyst, heated mixing -> ore stone.
// Crushing an ore stone -> avg 2 crushed raw ore (2 crushed -> 1 raw ore,
// existing cozy compacting recipes). No pebbles back.
// Washing an ore stone -> avg 7 pieces of its secondary metal.
// Vein route: 1 ore stone + fluid, superheated -> 1 real ore block.

// Placeholder amounts, not settled yet.
const ORE_STONE_WATER = 250; // mB, crimsite catalyst
const VEIN_FLUID = 100; // mB per ore block

const ORE_STONES = [
  {
    stone: "create:crimsite",
    pebble: "createsifter:andesite_pebble",
    catalyst: { type: "neoforge:single", amount: ORE_STONE_WATER, fluid: "minecraft:water" },
    crushed: "create:crushed_raw_iron",
    piece: "createsifter:raw_osmium_piece",
    ore: "minecraft:iron_ore",
    second: { fluid: "c:chlorine", ore: "mekanism:osmium_ore" },
  },
  {
    stone: "create:veridium",
    pebble: "createsifter:basalt_pebble",
    catalyst: { tag: "c:dusts/sulfur" },
    crushed: "create:crushed_raw_copper",
    piece: null,
    ore: "minecraft:copper_ore",
    second: null,
  },
  {
    stone: "create:asurine",
    pebble: "kubejs:limestone_pebble",
    catalyst: { item: "mekanism:salt" },
    crushed: "create:crushed_raw_zinc",
    piece: "createsifter:raw_lead_piece",
    ore: "create:zinc_ore",
    second: { fluid: "c:hydrogen_chloride", ore: "mekanism:lead_ore" },
  },
  {
    stone: "create:ochrum",
    pebble: "createsifter:granite_pebble",
    catalyst: { item: "createsifter:dust" },
    crushed: "create:crushed_raw_gold",
    piece: "createsifter:raw_tin_piece",
    ore: "minecraft:gold_ore",
    second: { fluid: "c:hydrogen", ore: "mekanism:tin_ore" },
  },
];

// Create's own ore stone crushing, raw ore -> crushed ore, and every way
// out of crushed ore except compacting to raw ore. Ids that only load with
// mods not in the pack are left out.
const ORE_STONE_REMOVALS = [
  "create:crushing/crimsite",
  "create:crushing/crimsite_recycling",
  "create:crushing/veridium",
  "create:crushing/veridium_recycling",
  "create:crushing/asurine",
  "create:crushing/asurine_recycling",
  "create:crushing/ochrum",
  "create:crushing/ochrum_recycling",
  "create:crushing/raw_iron",
  "create:crushing/raw_iron_block",
  "create:crushing/raw_copper",
  "create:crushing/raw_copper_block",
  "create:crushing/raw_gold",
  "create:crushing/raw_gold_block",
  "create:crushing/raw_zinc",
  "create:crushing/raw_zinc_block",
  "create:crushing/raw_osmium",
  "create:crushing/raw_osmium_block",
  "create:crushing/raw_lead",
  "create:crushing/raw_lead_block",
  "create:crushing/raw_tin",
  "create:crushing/raw_tin_block",
  "create:crushing/raw_uranium",
  "create:crushing/raw_uranium_block",
  "create:splashing/crushed_raw_iron",
  "create:splashing/crushed_raw_copper",
  "create:splashing/crushed_raw_gold",
  "create:splashing/crushed_raw_zinc",
  "create:splashing/mekanism/crushed_raw_osmium",
  "create:splashing/mekanism/crushed_raw_lead",
  "create:splashing/mekanism/crushed_raw_tin",
  "create:splashing/mekanism/crushed_raw_uranium",
  "create:smelting/iron_ingot_from_crushed",
  "create:smelting/copper_ingot_from_crushed",
  "create:smelting/gold_ingot_from_crushed",
  "create:smelting/zinc_ingot_from_crushed",
  "create:smelting/ingot_osmium_compat_mekanism",
  "create:smelting/ingot_lead_compat_mekanism",
  "create:smelting/ingot_tin_compat_mekanism",
  "create:smelting/ingot_uranium_compat_mekanism",
  "create:blasting/iron_ingot_from_crushed",
  "create:blasting/copper_ingot_from_crushed",
  "create:blasting/gold_ingot_from_crushed",
  "create:blasting/zinc_ingot_from_crushed",
  "create:blasting/ingot_osmium_compat_mekanism",
  "create:blasting/ingot_lead_compat_mekanism",
  "create:blasting/ingot_tin_compat_mekanism",
  "create:blasting/ingot_uranium_compat_mekanism",
  "powergrid:magnetization/crushed_raw_iron",
];

// Crushed ores nothing makes anymore.
const UNUSED_CRUSHED = [
  "create:crushed_raw_osmium",
  "create:crushed_raw_lead",
  "create:crushed_raw_tin",
  "create:crushed_raw_uranium",
  "create:crushed_raw_silver",
  "create:crushed_raw_nickel",
  "create:crushed_raw_aluminum",
  "create:crushed_raw_platinum",
  "create:crushed_raw_quicksilver",
];

ServerEvents.recipes((event) => {
  ORE_STONE_REMOVALS.forEach((id) => event.remove({ id: id }));

  ORE_STONES.forEach((s) => {
    let name = s.stone.split(":")[1];

    // 8 pebbles + catalyst, heated.
    let ingredients = [];
    for (let i = 0; i < 8; i++) ingredients.push({ item: s.pebble });
    ingredients.push(s.catalyst);
    event
      .custom({
        type: "create:mixing",
        heat_requirement: "heated",
        ingredients: ingredients,
        results: [{ id: s.stone }],
      })
      .id("cozy:progression/mixing/" + name);

    // Crushing: 1 + 2 at 50% = avg 2 crushed raw ore.
    event
      .custom({
        type: "create:crushing",
        ingredients: [{ item: s.stone }],
        processing_time: 250,
        results: [
          { id: s.crushed },
          { chance: 0.5, id: s.crushed },
          { chance: 0.5, id: s.crushed },
        ],
      })
      .id("cozy:progression/crushing/" + name);

    // Washing: 6 + 2 at 50% = avg 7 secondary pieces.
    if (s.piece) {
      event
        .custom({
          type: "create:splashing",
          ingredients: [{ item: s.stone }],
          results: [
            { count: 6, id: s.piece },
            { chance: 0.5, id: s.piece },
            { chance: 0.5, id: s.piece },
          ],
        })
        .id("cozy:progression/splashing/" + name);
    }

    // Vein route, main metal: hydrofluoric acid.
    event
      .custom({
        type: "create:mixing",
        heat_requirement: "superheated",
        ingredients: [
          { item: s.stone },
          { type: "neoforge:tag", amount: VEIN_FLUID, tag: "c:hydrofluoric_acid" },
        ],
        results: [{ id: s.ore }],
      })
      .id("cozy:progression/mixing/vein/" + s.ore.split(":")[1]);

    // Vein route, secondary metal.
    if (s.second) {
      event
        .custom({
          type: "create:mixing",
          heat_requirement: "superheated",
          ingredients: [
            { item: s.stone },
            { type: "neoforge:tag", amount: VEIN_FLUID, tag: s.second.fluid },
          ],
          results: [{ id: s.second.ore }],
        })
        .id("cozy:progression/mixing/vein/" + s.second.ore.split(":")[1]);
    }
  });
});

RecipeViewerEvents.removeEntries("item", (event) => {
  UNUSED_CRUSHED.forEach((id) => event.remove(id));
});
