// Pebbles Create Sifting doesn't ship. The rest (stone, andesite, diorite,
// granite, calcite, basalt) are createsifter's own. Textures are recolored
// stone pebbles, placeholders until real art.
StartupEvents.registry("item", (event) => {
  event.create("limestone_pebble");
  event.create("scoria_pebble");
  event.create("netherrack_pebble");
});
