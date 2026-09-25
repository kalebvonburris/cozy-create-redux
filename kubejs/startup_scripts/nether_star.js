// Nether star assembly line.
// Dust is the crushed intermediate; the incomplete star is the
// sequenced-assembly transitional item. Names come from lang, textures
// from assets/kubejs/textures/item/<id>.png, models are auto-generated.
StartupEvents.registry('item', event => {
  event.create('nether_star_dust')
  event.create('incomplete_nether_star')
})
