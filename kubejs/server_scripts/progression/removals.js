// Things the progression redesign takes out of the pack.
// See claude/progression-redesign.md in the project for the reasoning.

// Items that lose every recipe here, also hidden from the recipe viewer.
const PROGRESSION_HIDDEN = [
  // Industrial Foregoing laser drills: free ore, skips every line.
  "industrialforegoing:laser_drill",
  "industrialforegoing:ore_laser_base",
  "industrialforegoing:fluid_laser_base",
  // Sturdy meshes are cut from the mesh ladder.
  "createsifter:sturdy_mesh",
  "createsifter:advanced_sturdy_mesh",
  // Budding Nether Quartz ships a certus-style ladder. Only flawless is
  // used (made in the Crystal Fixer, never degrades).
  "buddingnetherquartz:damaged_budding_quartz",
  "buddingnetherquartz:chipped_budding_quartz",
  "buddingnetherquartz:flawed_budding_quartz",
  "buddingnetherquartz:quartz_dust",
];

ServerEvents.recipes((event) => {
  // Laser drill machines and everything they run.
  event.remove({ id: "industrialforegoing:laser_drill" });
  event.remove({ id: "industrialforegoing:ore_laser_base" });
  event.remove({ id: "industrialforegoing:fluid_laser_base" });
  event.remove({ type: "industrialforegoing:laser_drill_ore" });
  event.remove({ type: "industrialforegoing:laser_drill_fluid" });

  // Sturdy meshes, and anything sifted with them.
  event.remove({ output: "createsifter:sturdy_mesh" });
  event.remove({ output: "createsifter:advanced_sturdy_mesh" });
  [
    "createsifter:sifting/crushed_basalt_sturdy",
    "createsifter:sifting/crushed_basalt_advance_sturdy",
    "createsifter:sifting/crushed_end_stone_sturdy",
    "createsifter:sifting/crushed_end_stone_advance_sturdy",
  ].forEach((id) => event.remove({ id: id }));

  // Budding Nether Quartz's own recipes. Several of them make AE2 budding
  // certus out of nether quartz blocks, which would be a second certus route.
  event.remove({ mod: "buddingnetherquartz" });
});

RecipeViewerEvents.removeEntries("item", (event) => {
  PROGRESSION_HIDDEN.forEach((id) => event.remove(id));
});
