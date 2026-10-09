// Endgame tier items. Recipes are JSON under data/cozy/recipe/tiers/, the
// Truly Modular materials under data/cozy/miapi/materials/. Names come from
// lang, textures from assets/kubejs/textures/item/<id>.png.
//
//   I   Kinetic  Stellarite ingot   6x brass + 6x experience + 6x netherite
//   II  Fission  Neutronium ingot   7 Stellarite + 6x refined obsidian + 6x fluix
//   III Fusion   Dark Matter ingot  8 Neutronium + 6x nether star + antimatter,
//                                   through Atomic Ambiguity
StartupEvents.registry("item", (event) => {
  event.create("stellarite_ingot").rarity("uncommon").fireResistant();
  event.create("neutronium_ingot").rarity("rare").fireResistant();
  event.create("atomic_ambiguity").rarity("epic").fireResistant();
  event.create("dark_matter_ingot").rarity("epic").fireResistant();

  // Tier II reward. Crafted with any damageable item and a nether star to
  // make that item unbreakable; see server_scripts/unbreakable.js.
  event.create("unbreakable_template").rarity("rare");
});
