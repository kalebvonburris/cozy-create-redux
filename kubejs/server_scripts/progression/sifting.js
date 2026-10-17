// Sifting and splashing.
//
// Every sift gives one output plus XP nuggets, scaled by the mesh ladder:
// base n x mesh multiplier per block. Sifting never gives pebbles. Rocks are
// sifted as their crushed block (gravel, sand, soul sand and dust already
// are one).
// Splashing is the no-sifter early route: the densest metal, as raw ore.

// Mesh ladder. Advanced meshes only fit the brass sifter (the mod enforces it).
const SIFT_MESHES = [
  { mesh: "createsifter:string_mesh", mult: 1 },
  { mesh: "createsifter:andesite_mesh", mult: 1.25 },
  { mesh: "createsifter:zinc_mesh", mult: 1.5 },
  { mesh: "createsifter:brass_mesh", mult: 2 },
  { mesh: "createsifter:advanced_brass_mesh", mult: 2.5 },
];

// Base rate for ore pieces, amethyst and quartz: advanced brass = 9/32, so
// 32 blocks per raw ore there.
const SIFT_N = 0.1125;

// XP nuggets on every sift, flat per block. Placeholder until set.
const SIFT_XP = 0.1;

// input -> output, n
const SIFT_TABLE = [
  {
    input: "minecraft:gravel",
    output: "createsifter:raw_iron_piece",
    n: SIFT_N,
  },
  { input: "minecraft:sand", output: "createsifter:raw_zinc_piece", n: SIFT_N },
  {
    input: "kubejs:crushed_andesite",
    output: "createsifter:raw_iron_piece",
    n: SIFT_N,
  },
  {
    input: "kubejs:crushed_limestone",
    output: "createsifter:raw_zinc_piece",
    n: SIFT_N,
  },
  {
    input: "createsifter:crushed_basalt",
    output: "createsifter:raw_copper_piece",
    n: SIFT_N,
  },
  {
    input: "kubejs:crushed_granite",
    output: "createsifter:raw_gold_piece",
    n: SIFT_N,
  },
  {
    input: "kubejs:crushed_diorite",
    output: "minecraft:amethyst_shard",
    n: SIFT_N,
  },
  { input: "minecraft:soul_sand", output: "minecraft:quartz", n: SIFT_N },
  { input: "createsifter:dust", output: "minecraft:bone_meal", n: 0.5 },
];

// 9 pieces -> 1 raw ore, for every metal the pack uses.
const PIECE_RAW_ORE = [
  { piece: "createsifter:raw_iron_piece", raw: "minecraft:raw_iron" },
  { piece: "createsifter:raw_copper_piece", raw: "minecraft:raw_copper" },
  { piece: "createsifter:raw_gold_piece", raw: "minecraft:raw_gold" },
  { piece: "createsifter:raw_zinc_piece", raw: "create:raw_zinc" },
  { piece: "createsifter:raw_osmium_piece", raw: "mekanism:raw_osmium" },
  { piece: "createsifter:raw_lead_piece", raw: "mekanism:raw_lead" },
  { piece: "createsifter:raw_tin_piece", raw: "mekanism:raw_tin" },
];

// Pieces for metals that aren't in the pack, or that no line makes.
const UNUSED_PIECES = [
  "createsifter:raw_silver_piece",
  "createsifter:raw_quicksilver_piece",
  "createsifter:raw_aluminum_piece",
  "createsifter:raw_platinum_piece",
  "createsifter:raw_nickel_piece",
  "createsifter:raw_uranium_piece",
];

// Splashing: densest metal of the rock, as raw ore. 0.2 pieces' worth per
// block, about 45 blocks per raw ore.
const SPLASH_RAW_CHANCE = 0.2 / 9;
const SPLASH_TABLE = [
  { input: "minecraft:gravel", output: "minecraft:raw_copper" },
  { input: "minecraft:sand", output: "minecraft:raw_gold" },
];

ServerEvents.recipes((event) => {
  // An average amount as whole guaranteed items plus one chance roll.
  let amount = (id, avg) => {
    let out = [];
    let whole = Math.floor(avg);
    let rest = Math.round((avg - whole) * 10000) / 10000;
    if (whole > 0) out.push({ count: whole, id: id });
    if (rest > 0) out.push({ chance: rest, id: id });
    return out;
  };

  // --- Removals -----------------------------------------------------------

  // Every sifting recipe in the pack, Create Sifting's and our old ones.
  event.remove({ type: "createsifter:sifting" });

  // Create's free splashing routes.
  [
    "create:splashing/gravel",
    "create:splashing/sand",
    "create:splashing/red_sand",
    "create:splashing/soul_sand",
  ].forEach((id) => event.remove({ id: id }));

  // Create Sifting's 4 pieces -> 1 crushed ore. Replaced with 9 -> raw ore.
  PIECE_RAW_ORE.map((p) => p.piece)
    .concat(UNUSED_PIECES)
    .forEach((piece) =>
      event.remove({ id: "createsifter:shapeless/" + piece.split(":")[1] }),
    );

  // --- Sifting ------------------------------------------------------------

  SIFT_TABLE.forEach((row) => {
    let name = row.input.split(":")[1];
    SIFT_MESHES.forEach((m) => {
      let meshName = m.mesh.split(":")[1];
      event
        .custom({
          type: "createsifter:sifting",
          input: { item: row.input },
          mesh: { count: 1, id: m.mesh },
          processingTime: 500,
          results: amount(row.output, row.n * m.mult).concat(
            amount("create:experience_nugget", SIFT_XP),
          ),
        })
        .id("cozy:progression/sifting/" + name + "/" + meshName);
    });
  });

  // --- Pieces to raw ore --------------------------------------------------

  PIECE_RAW_ORE.forEach((p) => {
    let pieces = [];
    for (let i = 0; i < 9; i++) pieces.push(p.piece);
    event
      .shapeless(p.raw, pieces)
      .id("cozy:progression/crafting/" + p.raw.split(":")[1] + "_from_pieces");
  });

  // --- Splashing ----------------------------------------------------------

  SPLASH_TABLE.forEach((row) => {
    event
      .custom({
        type: "create:splashing",
        ingredients: [{ item: row.input }],
        results: [{ chance: SPLASH_RAW_CHANCE, id: row.output }],
      })
      .id("cozy:progression/splashing/" + row.input.split(":")[1]);
  });

  // Washing dust gives salt.
  event
    .custom({
      type: "create:splashing",
      ingredients: [{ item: "createsifter:dust" }],
      results: [{ chance: 0.5, id: "mekanism:salt" }],
    })
    .id("cozy:progression/splashing/dust");
});

RecipeViewerEvents.removeEntries("item", (event) => {
  UNUSED_PIECES.forEach((id) => event.remove(id));
});
