// Tier II (Fission) reward: unbreakable templates.
//
// 6x fluix + 6x refined obsidian makes 6 templates. A template, any item
// that takes damage, and a nether star make that item unbreakable. The
// recipe matches any item, then the result handler below checks it.
const $DataComponents = Java.loadClass("net.minecraft.core.component.DataComponents");
const $Unbreakable = Java.loadClass("net.minecraft.world.item.component.Unbreakable");

const UNBREAKABLE_TEMPLATE = "kubejs:unbreakable_template";

ServerEvents.recipes((event) => {
  event
    .shapeless(Item.of(UNBREAKABLE_TEMPLATE, 6), [
      "kubejs:compressed_fluix_6x",
      "kubejs:compressed_refined_obsidian_6x",
    ])
    .id("cozy:tiers/unbreakable_template");

  // The netherite pickaxe is only what JEI shows; the real result is the
  // input item, made unbreakable.
  event
    .shapeless("minecraft:netherite_pickaxe", [
      UNBREAKABLE_TEMPLATE,
      "*",
      "minecraft:nether_star",
    ])
    .modifyResult("cozy:apply_unbreakable")
    .id("cozy:tiers/apply_unbreakable");
});

ServerEvents.modifyRecipeResult("cozy:apply_unbreakable", (event) => {
  let grid = event.grid;
  let target = null;

  for (let i = 0; i < grid.size(); i++) {
    let stack = grid.getItem(i);
    if (stack.isEmpty()) continue;
    let id = String(stack.id);
    if (id == UNBREAKABLE_TEMPLATE || id == "minecraft:nether_star") continue;
    // More than one candidate means the grid isn't template + item + star.
    if (target != null) return event.success(Item.getEmpty());
    target = stack;
  }

  // Also refuses items that are already unbreakable.
  if (target == null || !target.isDamageableItem()) {
    return event.success(Item.getEmpty());
  }

  let result = target.copyWithCount(1);
  result.setDamageValue(0);
  result.set($DataComponents.UNBREAKABLE, new $Unbreakable(true));
  event.success(result);
});
