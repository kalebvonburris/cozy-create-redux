// Endgame tier items, blocks and fluids. Stellarite and Neutronium recipes
// are in server_scripts/progression/capstone.js, Dark Matter's are JSON under
// data/cozy/recipe/tiers/. The Truly Modular materials are under
// data/cozy/miapi/materials/. Names come from lang, textures from
// assets/kubejs/textures/.
//
//   I   Stellarite   Luminous Brass + Imbued Netherite + Crystallized Levels,
//                    sequenced assembly
//   II  Neutronium   Neutron Core + Neutronium Fluix + Shielded Casing +
//                    Stellarite, sequenced assembly, then the Reaction Chamber
//   III Dark Matter  8 Neutronium + 6x nether star + antimatter, through
//                    Atomic Ambiguity
StartupEvents.registry("item", (event) => {
  event.create("stellarite_ingot").rarity("uncommon").fireResistant();
  event.create("neutronium_ingot").rarity("rare").fireResistant();
  event.create("atomic_ambiguity").rarity("epic").fireResistant();
  event.create("dark_matter_ingot").rarity("epic").fireResistant();

  // Tier I intermediates.
  event.create("imbued_netherite").rarity("uncommon").fireResistant();
  event.create("crystallized_levels").rarity("uncommon");
  event.create("incomplete_stellarite_ingot", "create:sequenced_assembly");

  // Tier II intermediates.
  event.create("neutron_core").rarity("rare").fireResistant();
  event.create("neutronium_fluix").rarity("rare");
  event.create("shielded_casing").rarity("uncommon");
  event.create("neutron_dense_bar").rarity("rare").fireResistant();
  event.create("incomplete_neutron_dense_bar", "create:sequenced_assembly");

  // Tier II reward. Crafted with any damageable item and a nether star to
  // make that item unbreakable; see server_scripts/unbreakable.js.
  event.create("unbreakable_template").rarity("rare");
});

// Capstone storage blocks, 4 ingots each.
StartupEvents.registry("block", (event) => {
  ["stellarite", "neutronium", "dark_matter"].forEach((tier) => {
    event
      .create(tier + "_block")
      .soundType(SoundType.NETHERITE_BLOCK)
      .hardness(50)
      .resistance(1200)
      .requiresTool(true)
      .tagBlock("minecraft:mineable/pickaxe")
      .tagBlock("minecraft:needs_diamond_tool");
  });
});

// Tier I fluid, filled onto Imbued Netherite in the Stellarite assembly.
StartupEvents.registry("fluid", (event) => {
  event.create("luminous_brass", "thick").tint(0xf2d45c);
});
