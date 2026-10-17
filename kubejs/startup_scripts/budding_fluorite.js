// Budding fluorite: a budding block that never decays and grows fluorite
// buds like budding amethyst (1 in 5 random ticks, random side, 4 stages).
// Made in ExtendedAE's Crystal Fixer from a fluorite block, see
// server_scripts/progression/gems.js. Tagged c:budding_blocks, so AE2
// Growth Accelerators speed it up.
//
// Blockstates, models and loot tables are hand-written under
// assets/kubejs and data/kubejs (buds need a facing property).

// Growth order. Each stage grows into the next one.
global.fluoriteBuds = [
  "kubejs:small_fluorite_bud",
  "kubejs:medium_fluorite_bud",
  "kubejs:large_fluorite_bud",
  "kubejs:fluorite_cluster",
];

StartupEvents.registry("block", (event) => {
  event
    .create("budding_fluorite")
    .soundType(SoundType.AMETHYST)
    .hardness(1.5)
    .resistance(1.5)
    .requiresTool(true)
    .tagBlock("minecraft:mineable/pickaxe")
    .tagBlock("c:budding_blocks")
    .tagItem("c:budding_blocks")
    .noDrops()
    .randomTick((tick) => {
      if (tick.random.nextInt(5) != 0) return;
      let dir = Direction.VALUES[tick.random.nextInt(6)];
      let side = String(dir.getSerializedName());
      let target = tick.block.offset(dir);
      let state = target.blockState;
      let next = null;
      if (state.isAir()) {
        next = global.fluoriteBuds[0];
      } else {
        let stage = global.fluoriteBuds.indexOf(String(state.id));
        if (
          stage >= 0 &&
          stage < global.fluoriteBuds.length - 1 &&
          String(target.properties.get("facing")) == side
        ) {
          next = global.fluoriteBuds[stage + 1];
        }
      }
      if (next) target.set(Block.getBlock(next), { facing: side });
    });

  // Buds and cluster: 6-way facing, cross model, no collision.
  [
    { id: "small_fluorite_bud", sound: SoundType.SMALL_AMETHYST_BUD, light: 1 },
    {
      id: "medium_fluorite_bud",
      sound: SoundType.MEDIUM_AMETHYST_BUD,
      light: 2,
    },
    { id: "large_fluorite_bud", sound: SoundType.LARGE_AMETHYST_BUD, light: 4 },
    { id: "fluorite_cluster", sound: SoundType.AMETHYST_CLUSTER, light: 5 },
  ].forEach((bud) => {
    let builder = event
      .create(bud.id)
      .soundType(bud.sound)
      .hardness(1.5)
      .resistance(1.5)
      .lightLevel((bud.light + 0.5) / 15)
      .property(BlockProperties.FACING)
      .defaultState((s) => s.setValue(BlockProperties.FACING, Direction.UP))
      .placementState((s) =>
        s.setValue(BlockProperties.FACING, s.getClickedFace()),
      )
      .noCollision()
      .notSolid()
      .defaultCutout()
      .box(3, 3, 3, 13, 13, 13)
      .tagBlock("minecraft:mineable/pickaxe")
      .noDrops();
    if (bud.id == "fluorite_cluster") {
      builder.tagBlock("c:clusters").tagItem("c:clusters");
    } else {
      builder.tagBlock("c:buds").tagItem("c:buds");
    }
  });
});
