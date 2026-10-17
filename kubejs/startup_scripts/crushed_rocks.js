// Crushed rocks Create Sifting doesn't ship (it has basalt and netherrack).
// Rock -> crushed rock -> pebbles; crushed rocks are what gets sifted. Falls
// like gravel. Textures are the gravel pattern in each rock's colors.
StartupEvents.registry("block", (event) => {
  ["andesite", "diorite", "granite", "calcite", "limestone", "scoria"].forEach(
    (rock) => {
      event
        .create("crushed_" + rock, "falling")
        .soundType(SoundType.GRAVEL)
        .hardness(0.6)
        .resistance(0.6)
        .tagBlock("minecraft:mineable/shovel");
    },
  );
});
