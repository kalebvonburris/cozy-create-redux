// Gems and budding crystals.
//
// Lapis: limestone pebbles + sulfur, heated -> lapis ore (vein).
// Emerald: quartz + fluorite, heated mixing.
// Fluorite kickstart: 8 calcite + 1 salt, heated. Bulk fluorite comes from
// budding fluorite.
// Budding blocks: amethyst by crafting; quartz and fluorite in ExtendedAE's
// Crystal Fixer, fuel charged certus, 1% per roll (chance is out of 10000).

// Placeholder amounts, not settled yet.
const LAPIS_PEBBLES = 8; // limestone pebbles per lapis ore
const EMERALD_QUARTZ = 1; // quartz per emerald
const EMERALD_FLUORITE = 1; // fluorite per emerald

const CRYSTAL_FIXER = [
  {
    input: "minecraft:quartz_block",
    output: "buddingnetherquartz:flawless_budding_quartz",
  },
  { input: "mekanism:block_fluorite", output: "kubejs:budding_fluorite" },
];

ServerEvents.recipes((event) => {
  let copies = (ingredient, n) => {
    let list = [];
    for (let i = 0; i < n; i++) list.push(ingredient);
    return list;
  };

  // Apothic Enchanting's amethyst block infusion. One route per item.
  event.remove({ id: "apothic_enchanting:infusion/budding_amethyst" });

  // --- Lapis ----------------------------------------------------------------

  event
    .custom({
      type: "create:mixing",
      heat_requirement: "heated",
      ingredients: copies(
        { item: "kubejs:limestone_pebble" },
        LAPIS_PEBBLES,
      ).concat([{ tag: "c:dusts/sulfur" }]),
      results: [{ id: "minecraft:lapis_ore" }],
    })
    .id("cozy:progression/mixing/lapis_ore");

  // --- Emerald --------------------------------------------------------------

  event
    .custom({
      type: "create:mixing",
      heat_requirement: "heated",
      ingredients: copies({ item: "minecraft:quartz" }, EMERALD_QUARTZ).concat(
        copies({ tag: "c:gems/fluorite" }, EMERALD_FLUORITE),
      ),
      results: [{ id: "minecraft:emerald" }],
    })
    .id("cozy:progression/mixing/emerald");

  // --- Fluorite kickstart ---------------------------------------------------

  event
    .custom({
      type: "create:mixing",
      heat_requirement: "heated",
      ingredients: copies({ item: "minecraft:calcite" }, 8).concat([
        { item: "mekanism:salt" },
      ]),
      results: [{ id: "mekanism:fluorite_gem" }],
    })
    .id("cozy:progression/mixing/fluorite_gem");

  // --- Budding blocks -------------------------------------------------------

  event
    .shaped("minecraft:budding_amethyst", ["AAA", "AQA", "AAA"], {
      A: "minecraft:amethyst_block",
      Q: "minecraft:quartz_block",
    })
    .id("cozy:progression/crafting/budding_amethyst");

  CRYSTAL_FIXER.forEach((r) => {
    event
      .custom({
        type: "extendedae:crystal_fixer",
        chance: 100,
        fuel: { ingredient: { item: "ae2:charged_certus_quartz_crystal" } },
        input: { count: 1, id: r.input },
        output: { count: 1, id: r.output },
      })
      .id("cozy:progression/crystal_fixer/" + r.output.split(":")[1]);
  });
});
