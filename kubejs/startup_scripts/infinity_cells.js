// Infinity cells, built from one list.
//
// Each entry registers kubejs:infinity_<name>_cell through ExtendedAE's own
// KubeJS builder. The game names it "ME Infinity <Thing> Cell". Recipes are
// generated from this same list in server_scripts/infinity_cells.js, so this
// is the only place to edit.
//
//   name     cell id suffix
//   item     what the cell supplies, or
//   fluid    a fluid instead
//   cost     Create Compression material, defaults to name. The recipe takes
//            one 6x compressed block of it.
//
// What a 6x block actually is depends on what that material compresses from:
//   stone and soil compress from the block itself       9^6 = 531,441
//   metals and most gems compress from storage blocks   9^7 = 4,782,969
//   quartz and amethyst blocks hold 4, not 9            9^6 x 4 = 2,125,764
global.infinityCells = [
  // stone and soil, "proven" by the Create lines that make them
  { name: 'cobblestone', item: 'minecraft:cobblestone' },
  { name: 'dirt',        item: 'minecraft:dirt' },
  { name: 'sand',        item: 'minecraft:sand' },
  { name: 'gravel',      item: 'minecraft:gravel' },
  { name: 'andesite',    item: 'minecraft:andesite' },
  { name: 'basalt',      item: 'minecraft:basalt' },
  { name: 'blackstone',  item: 'minecraft:blackstone' },
  { name: 'netherrack',  item: 'minecraft:netherrack' },
  { name: 'end_stone',   item: 'minecraft:end_stone' },

  // lava is proven by obsidian: every block of it consumed a lava source
  { name: 'lava', fluid: 'minecraft:lava', cost: 'obsidian' },

  // metals
  { name: 'iron',      item: 'minecraft:iron_ingot' },
  { name: 'gold',      item: 'minecraft:gold_ingot' },
  { name: 'copper',    item: 'minecraft:copper_ingot' },
  { name: 'zinc',      item: 'create:zinc_ingot' },
  { name: 'brass',     item: 'create:brass_ingot' },
  { name: 'netherite', item: 'minecraft:netherite_ingot' },

  // gems and minerals
  { name: 'diamond',  item: 'minecraft:diamond' },
  { name: 'emerald',  item: 'minecraft:emerald' },
  { name: 'lapis',    item: 'minecraft:lapis_lazuli' },
  { name: 'quartz',   item: 'minecraft:quartz' },
  { name: 'redstone', item: 'minecraft:redstone' },
  { name: 'coal',     item: 'minecraft:coal' },
  { name: 'amethyst', item: 'minecraft:amethyst_shard' }
]

StartupEvents.registry('item', event => {
  global.infinityCells.forEach(cell => {
    let builder = event.create('infinity_' + cell.name + '_cell', 'extendedae:custom_infinity_cell')
      .cellModel('extendedae:block/drive/infinity_cobblestone_cell')
      .textures({ layer0: 'extendedae:item/infinity_cell', layer1: 'ae2:item/storage_cell_led' })
    if (cell.fluid) {
      builder.fluidType(cell.fluid)
    } else {
      builder.itemType(cell.item)
    }
  })
})
