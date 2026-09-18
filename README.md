# Cozy Create Redux

Cozy Create's mod list rebuilt on 1.21.1 / NeoForge with Create 6.

packwiz is the source of truth. `mods/*.pw.toml` carry a download
location and a hash for every mod, and the flake reads them directly.
Nothing is resolved at build time: every jar is a fixed-output fetch
against the hash packwiz recorded, so a build either reproduces the
pack exactly or fails.

## Outputs

    nix build .#client     Prism instance dir. zip it, Import from zip.
    nix build .#server     mods + config + pinned NeoForge installer + start.sh
    nix run   .#server     sync server build into ./server and start it
    nix develop            packwiz, jq, curl, zip

`client` includes mods marked `both` and `client`; `server` includes
`both` and `server`. The split comes from each mod's `side` field.

## Editing the pack

    nix develop
    packwiz cf add <curseforge url>     # or: packwiz mr add <modrinth slug>
    packwiz remove <slug>
    packwiz update --all
    packwiz refresh

Then build locally to catch problems before tagging:

    nix build .#client .#server

## Releasing

    git commit -am "bump"
    git tag v0.2.0
    git push --tags

The workflow builds both outputs and attaches
`cozy-create-client-v0.2.0.zip` and `cozy-create-server-v0.2.0.zip`
to the GitHub release. Player side: download the client zip, Prism,
Add Instance, Import from zip. Server side: download the server zip,
unzip, `./start.sh`.

## Bumping NeoForge

`pack.toml` has `neoforge = "..."`. The installer hash in `flake.nix`
is pinned to that exact version, so when you change one, change the
other: set the new version, replace the hash with `lib.fakeHash`,
build, copy the real hash out of the error.

## Running the server locally

    nix run .#server              # ./server
    nix run .#server -- /srv/mc   # anywhere else

First run installs NeoForge into that directory and stops on the EULA.
`echo eula=true > server/eula.txt` and run again. Heap and GC via
`JVM_OPTS="-Xms10G -Xmx10G" nix run .#server`.

Each run replaces `mods/` and the installer, and copies `config/` only
if it's missing. World, logs, eula, and edited configs are left alone.

## Gotchas

- CurseForge entries have no URL, only a file id. The flake constructs
  the CDN path. If a mod's author has disabled third-party distribution
  the fetch 404s and the build fails naming the mod. Fix: `packwiz
  remove` it and `packwiz mr add` from Modrinth, which always has a
  direct URL.
- Client-only mods (Sodium, Iris, Xaero's, Sound Physics, Distant
  Horizons client, Flywheel compat) must have `side = "client"` in their
  `.pw.toml`, or they land on the server and break the handshake.
  packwiz usually detects this; check the ones it doesn't.
- A dirty git tree makes `nix build .` warn and can make it miss new
  `.pw.toml` files. Commit before building.
