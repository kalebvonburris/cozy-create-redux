// Uranium, bismuth and polonium. Mekanism only.
//
// Uranium: diorite + sulfuric acid in the Chemical Dissolution Chamber ->
// dirty uranium slurry, then Mekanism's normal uranium chain.
// Bismuth: dirty lead + dirty zinc slurry in the Chemical Infuser -> dirty
// bismuth slurry, then More Mekanism Processing's bismuth chain.
// Polonium: bismuth dust + D-T fuel + heavy water in the Pressurized
// Reaction Chamber, with a lot of extra energy. Fission waste stays as the
// slow early route.

// Placeholder amounts, not settled yet.
const BISMUTH_SLURRY_IN = 1; // mB of each dirty slurry
const BISMUTH_SLURRY_OUT = 1; // mB of dirty bismuth slurry
const POLONIUM_PER_DUST = 100; // mB polonium per bismuth dust (1000 = 1 pellet)
const POLONIUM_FUEL = 100; // mB D-T fuel per dust
const POLONIUM_WATER = 100; // mB heavy water per dust
const POLONIUM_ENERGY = 100000; // extra FE per operation

ServerEvents.recipes((event) => {
  event
    .custom({
      type: "mekanism:dissolution",
      chemical_input: { amount: 1, chemical: "mekanism:sulfuric_acid" },
      item_input: { count: 1, item: "minecraft:diorite" },
      output: { amount: 100, id: "mekanism:dirty_uranium" },
      per_tick_usage: true,
    })
    .id("cozy:progression/dissolution/uranium_from_diorite");

  event
    .custom({
      type: "mekanism:chemical_infusing",
      left_input: {
        amount: BISMUTH_SLURRY_IN,
        chemical: "mekanism:dirty_lead",
      },
      right_input: {
        amount: BISMUTH_SLURRY_IN,
        chemical: "moremekanismprocessing:dirty_zinc",
      },
      output: {
        amount: BISMUTH_SLURRY_OUT,
        id: "moremekanismprocessing:dirty_bismuth",
      },
    })
    .id("cozy:progression/chemical_infusing/dirty_bismuth");

  event
    .custom({
      type: "mekanism:reaction",
      item_input: { count: 1, tag: "c:dusts/bismuth" },
      fluid_input: { amount: POLONIUM_WATER, tag: "c:heavy_water" },
      chemical_input: {
        amount: POLONIUM_FUEL,
        chemical: "mekanismgenerators:fusion_fuel",
      },
      duration: 100,
      energy_required: POLONIUM_ENERGY,
      chemical_output: { amount: POLONIUM_PER_DUST, id: "mekanism:polonium" },
    })
    .id("cozy:progression/reaction/polonium");
});
