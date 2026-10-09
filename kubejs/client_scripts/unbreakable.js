// The apply-unbreakable recipe matches any item, so JEI would list it as a
// use for everything, with a netherite pickaxe as the shown output. Hide it
// and explain the recipe on the template instead. Crafting still works.
// See server_scripts/unbreakable.js.
RecipeViewerEvents.removeRecipes((event) => {
  event.remove(["cozy:tiers/apply_unbreakable"]);
});

ItemEvents.modifyTooltips((event) => {
  event.add("kubejs:unbreakable_template", [
    Text.gray("Craft with any damageable item and a nether star"),
    Text.gray("to make that item unbreakable."),
  ]);
});
