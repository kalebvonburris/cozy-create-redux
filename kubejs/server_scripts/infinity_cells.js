// Recipes for every cell in startup_scripts/infinity_cells.js.
// Same shape as ExtendedAE's own water cell, with one 6x Create Compression
// block where the water goes.
ServerEvents.recipes((event) => {
  // Infinite cobble should be earned through Create, not three water buckets.
  // ExtendedAE's water cell stays; water is trivially infinite anyway.
  event.remove({ id: "extendedae:cobblestone_cell" });

  global.infinityCells.forEach((cell) => {
    let cost =
      cell.costId ||
      "createcompression:compressed_" + (cell.cost || cell.name) + "_6x";
    // Antimatter cells swap the middle diamond for a pellet.
    let key = {
      C: "ae2:quartz_glass",
      K: cost,
      X: "ae2:cell_component_16k",
      I: "#c:gems/diamond",
    };
    let bottom = "III";
    if (cell.antimatter) {
      key.A = "mekanism:pellet_antimatter";
      bottom = "IAI";
    }
    event
      .shaped(
        "kubejs:infinity_" + cell.name + "_cell",
        ["CKC", "CXC", bottom],
        key,
      )
      .id("cozy:infinity_cell/" + cell.name);
  });
});

// The recipe is gone; hide the item from JEI too.
RecipeViewerEvents.removeEntries("item", (event) => {
  event.remove("extendedae:infinity_cobblestone_cell");
});
