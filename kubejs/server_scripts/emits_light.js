// Builds c:emits_light for blocks and their items, so #emits_light works in JEI.
// Replaces EmitLightTag, which crashes by writing into the immutable tag map in
// MappedRegistry.bindTags. Tags added here exist before binding.
const BuiltInRegistries = Java.loadClass(
  "net.minecraft.core.registries.BuiltInRegistries",
);
const Item = Java.loadClass("net.minecraft.world.item.Item");

let emitsLight = null;

// Any block with a state that can give off light, including conditional
// sources like an unlit redstone lamp.
const scan = () => {
  if (emitsLight) return emitsLight;

  let blocks = [];
  let items = [];
  let registry = BuiltInRegistries.BLOCK;

  for (let i = 0; i < registry.size(); i++) {
    let block = registry.byId(i);
    let id = String(registry.getKey(block));
    try {
      let states = block.getStateDefinition().getPossibleStates();
      let lit = false;
      for (let j = 0; j < states.size() && !lit; j++) {
        let state = states.get(j);
        lit = state.getLightEmission() > 0 || state.hasDynamicLightEmission();
      }
      if (!lit) continue;

      blocks.push(id);
      let itemId = String(BuiltInRegistries.ITEM.getKey(Item.byBlock(block)));
      if (itemId !== "minecraft:air") items.push(itemId);
    } catch (e) {
      console.warn("emits_light: skipping " + id + ": " + e);
    }
  }

  console.info(
    "emits_light: " + blocks.length + " blocks, " + items.length + " items",
  );
  emitsLight = { blocks: blocks, items: items };
  return emitsLight;
};

ServerEvents.tags("block", (event) => {
  event.add("c:emits_light", scan().blocks);
});

ServerEvents.tags("item", (event) => {
  event.add("c:emits_light", scan().items);
});
