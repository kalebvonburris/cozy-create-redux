// Capstone tiers I and II, and the storage blocks for all three.
// Tier III (Dark Matter) stays in data/cozy/recipe/tiers/.

// Placeholder amounts, not settled yet.
const LUMINOUS_BRASS_MADE = 1000; // mB per mixing
const LUMINOUS_BRASS_FILL = 1000; // mB per Stellarite ingot
const NEUTRON_CORE_FLUID = { amount: 16000, fluid: "mekanism:heavy_water" };
const NEUTRON_CORE_ENERGY = 1000000000;
const NEUTRONIUM_FLUID = {
  amount: 16000,
  fluid: "mekanism:superheated_sodium",
};
const NEUTRONIUM_ENERGY = 1073741823;

const CAPSTONE_BLOCKS = ["stellarite", "neutronium", "dark_matter"];

ServerEvents.recipes((event) => {
  let copies = (ingredient, n) => {
    let list = [];
    for (let i = 0; i < n; i++) list.push(ingredient);
    return list;
  };
  // One sequenced assembly step on a transitional item.
  let deploy = (transitional, item) => ({
    type: "create:deploying",
    ingredients: [{ item: transitional }, { item: item }],
    results: [{ id: transitional }],
  });
  let press = (transitional) => ({
    type: "create:pressing",
    ingredients: [{ item: transitional }],
    results: [{ id: transitional }],
  });
  let fill = (transitional, fluid, amount) => ({
    type: "create:filling",
    ingredients: [
      { item: transitional },
      { type: "neoforge:single", amount: amount, fluid: fluid },
    ],
    results: [{ id: transitional }],
  });

  // --- Tier I: Stellarite ---------------------------------------------------

  // Luminous Brass: 6x brass + tin + glowstone.
  event
    .custom({
      type: "create:mixing",
      heat_requirement: "superheated",
      ingredients: [
        { item: "createcompression:compressed_brass_6x" },
        { tag: "c:ingots/tin" },
        { item: "minecraft:glowstone" },
      ],
      results: [{ amount: LUMINOUS_BRASS_MADE, id: "kubejs:luminous_brass" }],
    })
    .id("cozy:tiers/mixing/luminous_brass");

  // Imbued Netherite: 6x netherite + lapis block + experience block.
  event
    .custom({
      type: "create:mixing",
      heat_requirement: "superheated",
      ingredients: [
        { item: "createcompression:compressed_netherite_6x" },
        { item: "minecraft:lapis_block" },
        { item: "create:experience_block" },
      ],
      results: [{ id: "kubejs:imbued_netherite" }],
    })
    .id("cozy:tiers/mixing/imbued_netherite");

  // Crystallized Levels: 6x experience + amethyst block.
  event
    .custom({
      type: "create:mixing",
      heat_requirement: "superheated",
      ingredients: [
        { item: "createcompression:compressed_experience_6x" },
        { item: "minecraft:amethyst_block" },
      ],
      results: [{ id: "kubejs:crystallized_levels" }],
    })
    .id("cozy:tiers/mixing/crystallized_levels");

  // Stellarite ingot: on Imbued Netherite, deploy emerald block -> fill
  // Luminous Brass -> press x3 -> deploy Crystallized Levels.
  let stellarite = "kubejs:incomplete_stellarite_ingot";
  event
    .custom({
      type: "create:sequenced_assembly",
      ingredient: { item: "kubejs:imbued_netherite" },
      loops: 1,
      results: [{ id: "kubejs:stellarite_ingot" }],
      sequence: [
        deploy(stellarite, "minecraft:emerald_block"),
        fill(stellarite, "kubejs:luminous_brass", LUMINOUS_BRASS_FILL),
        press(stellarite),
        press(stellarite),
        press(stellarite),
        deploy(stellarite, "kubejs:crystallized_levels"),
      ],
      transitional_item: { id: stellarite },
    })
    .id("cozy:tiers/sequenced_assembly/stellarite_ingot");

  // --- Tier II: Neutronium --------------------------------------------------

  // Neutron Core: 8 singularities + 6x refined obsidian.
  event
    .custom({
      type: "advanced_ae:reaction",
      input_energy: NEUTRON_CORE_ENERGY,
      input_fluid: {
        amount: NEUTRON_CORE_FLUID.amount,
        ingredient: { fluid: NEUTRON_CORE_FLUID.fluid },
      },
      input_items: [
        { amount: 8, ingredient: { item: "ae2:singularity" } },
        {
          amount: 1,
          ingredient: { item: "kubejs:compressed_refined_obsidian_6x" },
        },
      ],
      output: { "#": 1, "#t": "ae2:i", id: "kubejs:neutron_core" },
    })
    .id("cozy:tiers/reaction/neutron_core");

  // Neutronium Fluix: 6x fluix + 4 polonium + 4 plutonium pellets.
  event
    .custom({
      type: "create:compacting",
      heat_requirement: "superheated",
      ingredients: [{ item: "kubejs:compressed_fluix_6x" }]
        .concat(copies({ item: "mekanism:pellet_polonium" }, 4))
        .concat(copies({ item: "mekanism:pellet_plutonium" }, 4)),
      results: [{ id: "kubejs:neutronium_fluix" }],
    })
    .id("cozy:tiers/compacting/neutronium_fluix");

  // Shielded Casing: lead, steel and HDPE. Layout is a placeholder.
  event
    .shaped("kubejs:shielded_casing", ["PLP", "LSL", "PLP"], {
      P: "mekanism:hdpe_sheet",
      L: "#c:storage_blocks/lead",
      S: "#c:storage_blocks/steel",
    })
    .id("cozy:tiers/crafting/shielded_casing");

  // Neutron-dense Bar: on the Neutron Core, deploy Stellarite block ->
  // Neutronium Fluix -> Stellarite block -> Shielded Casing.
  let bar = "kubejs:incomplete_neutron_dense_bar";
  event
    .custom({
      type: "create:sequenced_assembly",
      ingredient: { item: "kubejs:neutron_core" },
      loops: 1,
      results: [{ id: "kubejs:neutron_dense_bar" }],
      sequence: [
        deploy(bar, "kubejs:stellarite_block"),
        deploy(bar, "kubejs:neutronium_fluix"),
        deploy(bar, "kubejs:stellarite_block"),
        deploy(bar, "kubejs:shielded_casing"),
      ],
      transitional_item: { id: bar },
    })
    .id("cozy:tiers/sequenced_assembly/neutron_dense_bar");

  // Neutronium ingot: the bar through the Reaction Chamber.
  event
    .custom({
      type: "advanced_ae:reaction",
      input_energy: NEUTRONIUM_ENERGY,
      input_fluid: {
        amount: NEUTRONIUM_FLUID.amount,
        ingredient: { fluid: NEUTRONIUM_FLUID.fluid },
      },
      input_items: [
        { amount: 1, ingredient: { item: "kubejs:neutron_dense_bar" } },
      ],
      output: { "#": 1, "#t": "ae2:i", id: "kubejs:neutronium_ingot" },
    })
    .id("cozy:tiers/reaction/neutronium_ingot");

  // --- Storage blocks -------------------------------------------------------

  CAPSTONE_BLOCKS.forEach((tier) => {
    let ingot = "kubejs:" + tier + "_ingot";
    let block = "kubejs:" + tier + "_block";
    event
      .shaped(block, ["II", "II"], { I: ingot })
      .id("cozy:tiers/crafting/" + tier + "_block");
    event
      .shapeless("4x " + ingot, [block])
      .id("cozy:tiers/crafting/" + tier + "_ingot_from_block");
  });
});
