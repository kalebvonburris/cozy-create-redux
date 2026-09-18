#!/usr/bin/env bash
# Rebuilds the Cozy Create shape on 1.21.1 / NeoForge.
# Run inside `nix develop`, after `packwiz init`.
#
# Slugs are CurseForge project slugs, taken from the URL:
#   curseforge.com/minecraft/mc-mods/<slug>
# Some will not resolve. That is expected and gets reported at the end
# rather than killing the run.

set -uo pipefail

if [ ! -f pack.toml ]; then
  cat >&2 <<'EOF'
no pack.toml here. run packwiz init first:

  packwiz init
    name:            Cozy Create Redux
    author:          you
    version:         0.1.0
    minecraft:       1.21.1
    loader:          neoforge
    loader version:  (take the latest it offers)
EOF
  exit 1
fi

failed=()

add() {
  local slug="$1"
  local why="${2:-}"
  printf '  %-36s %s\n' "$slug" "$why"
  if ! packwiz cf add "$slug" -y >/dev/null 2>&1; then
    failed+=("$slug")
  fi
}

echo "== Create and addons =="
add create                          "the point"
add create-crafts-additions         "rotation <-> FE, digital adapter"
add create-enchantment-industry     "liquid xp, blaze enchanter, mending on belt"
add create-new-age                  "electricity tier"
add create-steam-n-rails            "trains"
add create-deco                     "blocks"
add create-slice-and-dice           "saw recipes"
add createsifting                   "sifting, resource loop"
add create-recycle-everything       "melt anything back down"
add copycats                        "copycat blocks"

echo
echo "== Enchanting and gear =="
add apotheosis                      "enchanting overhaul, gems, affixes"
add apothic-attributes              "apotheosis dep"
add advanced-netherite              "netherite tiers past vanilla"

echo
echo "== Computing =="
add cc-tweaked                      "lua computers"
add advanced-peripherals            "ME bridge, chat box"

echo
echo "== Sanity =="
add almost-unified                  "collapses duplicate ores across mods"
add jei                             "recipes"
add jade                            "what am i looking at"
add sophisticated-storage
add sophisticated-backpacks
add waystones
add ftb-ultimine                    "vein mining"
add appleskin
add clumps                          "xp orb merging, real tps win"
add curios                          "dep for half the above"

echo
echo "== Performance =="
add ferritecore                     "30-50% less ram"
add modernfix                       "load times"
add entityculling
add embeddium                       "renderer; swap for sodium if you prefer"
add oculus                          "shaders; swap for iris if you use sodium"

echo
echo "== Audio =="
add sound-physics-remastered        "occlusion and reverb, client-side"
add presence-footsteps              "client-side"

echo
packwiz refresh

if [ ${#failed[@]} -gt 0 ]; then
  echo
  echo "did not resolve (${#failed[@]}):"
  printf '  %s\n' "${failed[@]}"
  echo
  echo "fix each by hand: packwiz cf add \"<search term>\" and pick from the list."
  echo "slugs drift and some of these are 1.20.1-era names."
fi

echo
echo "next: git init && git add -A && git commit -m init && git tag v0.1.0"
