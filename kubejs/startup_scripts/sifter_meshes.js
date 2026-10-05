// Sifter meshes ship with durability, and Minecraft refuses to let an item
// be both damageable and stackable. So drop the durability first, then
// raise the stack size. Side effect: meshes no longer wear out.
const SIFTER_MESHES = [
  'createsifter:string_mesh',
  'createsifter:andesite_mesh',
  'createsifter:zinc_mesh',
  'createsifter:brass_mesh',
  'createsifter:sturdy_mesh',
  'createsifter:custom_mesh',
  'createsifter:advanced_brass_mesh',
  'createsifter:advanced_sturdy_mesh'
]

ItemEvents.modification(event => {
  SIFTER_MESHES.forEach(id => {
    event.modify(id, item => {
      item.remove('minecraft:max_damage')
      item.remove('minecraft:damage')
      item.maxStackSize = 64
    })
  })
})
