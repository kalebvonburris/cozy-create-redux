// Compress and decompress recipes for every block in
// startup_scripts/compression.js. Same shape as Create Compression:
// 9 of a tier in a 3x3 makes the next, and one breaks back into 9.
ServerEvents.recipes((event) => {
  global.compressedMaterials.forEach((mat) => {
    for (let n = 1; n <= global.compressionTiers; n++) {
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
});
