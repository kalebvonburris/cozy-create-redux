// Compressed blocks for materials Create Compression doesn't cover.
//
// Each entry registers kubejs:compressed_<name>_1x .. _<TIERS>x, using
// Create Compression's own overlay textures so they look like the rest.
// Recipes are generated from this same list in server_scripts/compression.js.
//
//   name     id suffix
//   base     the block that 1x compresses from (9 of it)
//   texture  that block's texture
//
// A 6x block is 9^6 = 531,441 base blocks.
global.compressionTiers = 6;
global.compressedMaterials = [
  // 1 fluix block = 4 crystals
  { name: "fluix", base: "ae2:fluix_block", texture: "ae2:block/fluix_block" },
  // 1 block = 9 ingots
  {
    name: "refined_obsidian",
    base: "mekanism:block_refined_obsidian",
    texture: "mekanism:block/block_refined_obsidian",
  },
  // 1 block = 9 charcoal
  {
    name: "charcoal",
    base: "mekanism:block_charcoal",
    texture: "mekanism:block/block_charcoal",
  },
  // Create Sifting's dust block
  { name: "dust", base: "createsifter:dust", texture: "createsifter:block/dust" },
];

// A function per block, so the model callback (run later, on the client)
// keeps its own texture and tier instead of sharing loop variables.
const registerCompressedBlock = (event, texture, id, tier) => {
  let overlay = "createcompression:block/layer_" + tier;
  event
    .create(id)
    .hardness(5)
    .resistance(6)
    .requiresTool(true)
    .tagBlock("minecraft:mineable/pickaxe")
    .modelGenerator((m) => {
      // Same composite model Create Compression uses: the base block with a
      // translucent tier overlay on top.
      m.parent("minecraft:block/block");
      m.texture("particle", texture);
      m.custom((json) => {
        json.addProperty("loader", "neoforge:composite");
        json.add(
          "children",
          JsonUtils.of({
            solid: {
              parent: "minecraft:block/cube_all",
              render_type: "minecraft:solid",
              textures: { all: texture },
            },
            translucent: {
              parent: "minecraft:block/cube_all",
              render_type: "minecraft:translucent",
              textures: { all: overlay },
            },
          }),
        );
      });
    });
};

StartupEvents.registry("block", (event) => {
  global.compressedMaterials.forEach((mat) => {
    for (let n = 1; n <= global.compressionTiers; n++) {
      registerCompressedBlock(
        event,
        mat.texture,
        "compressed_" + mat.name + "_" + n + "x",
        n,
      );
    }
  });
});
