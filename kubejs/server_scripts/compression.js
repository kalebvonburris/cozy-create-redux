// Compress and decompress recipes for every block in
// startup_scripts/compression.js. Same shape as Create Compression:
// 9 of a tier in a 3x3 makes the next, and one breaks back into 9.
//
// Plus one alloy shortcut per material, at 3x only: 8 of the 1x around a 2x
// (or for netherite a 4x) of a partner material. Skips most of the bottom-tier
// volume. Nothing above 3x has a shortcut, so they don't stack.
const compressionAlloys = [
  {
    name: "experience",
    from: "createcompression:compressed_experience_1x",
    partner: "kubejs:compressed_refined_obsidian_2x",
    result: "createcompression:compressed_experience_3x",
  },
  {
    name: "brass",
    from: "createcompression:compressed_brass_1x",
    partner: "createcompression:compressed_glowstone_2x",
    result: "createcompression:compressed_brass_3x",
  },
  {
    name: "netherite",
    from: "createcompression:compressed_netherite_1x",
    partner: "createcompression:compressed_basalt_4x",
    result: "createcompression:compressed_netherite_3x",
  },
  {
    name: "refined_obsidian",
    from: "kubejs:compressed_refined_obsidian_1x",
    partner: "kubejs:compressed_crying_obsidian_2x",
    result: "kubejs:compressed_refined_obsidian_3x",
  },
  {
    name: "fluix",
    from: "kubejs:compressed_fluix_1x",
    partner: "kubejs:compressed_entro_2x",
    result: "kubejs:compressed_fluix_3x",
  },
  {
    name: "nether_star",
    from: "createcompression:compressed_nether_star_1x",
    partner: "kubejs:compressed_uranium_2x",
    result: "createcompression:compressed_nether_star_3x",
  },
  {
    name: "charcoal",
    from: "kubejs:compressed_charcoal_1x",
    partner: "createcompression:compressed_diamond_2x",
    result: "kubejs:compressed_charcoal_3x",
  },
];

ServerEvents.recipes((event) => {
  global.compressedMaterials.forEach((mat) => {
    let tiers = mat.tiers || global.compressionTiers;
    for (let n = 1; n <= tiers; n++) {
      let id = "kubejs:compressed_" + mat.name + "_" + n + "x";
      let below =
        n == 1 ? mat.base : "kubejs:compressed_" + mat.name + "_" + (n - 1) + "x";

      event
        .shaped(id, ["AAA", "AAA", "AAA"], { A: below })
        .id("cozy:compression/" + mat.name + "/compress_" + n + "x");
      event
        .shapeless(Item.of(below, 9), [id])
        .id("cozy:compression/" + mat.name + "/decompress_" + n + "x");
    }
  });

  compressionAlloys.forEach((alloy) => {
    event
      .shaped(alloy.result, ["AAA", "ABA", "AAA"], {
        A: alloy.from,
        B: alloy.partner,
      })
      .id("cozy:compression/alloy/" + alloy.name + "_3x");
  });
});
