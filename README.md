# Cozy Create Redux

Cozy Create's mod list rebuilt on 1.21.1 / NeoForge with Create 6.
One `pack.toml` feeds both the server and your friend's client.

## Layout

    flake.nix          devshell, instance builder, NixOS server module
    add-mods.sh        one-time mod list bootstrap
    make-instance.sh   builds the friend's Prism zip
    pack.toml          created by packwiz init
    index.toml         created by packwiz refresh
    mods/*.pw.toml     one file per mod, this is the actual pack

## 1. Build the pack

    nix develop
    packwiz init        # 1.21.1, neoforge, take the latest loader version
    ./add-mods.sh

Expect some slugs to miss. They print at the end; fix with
`packwiz cf add "<search term>"` and pick from the list.

Then commit and tag. Tag, not branch: `fetchPackwizModpack` hashes
whatever the URL returns, so a moving target rebuilds constantly.

    git init && git add -A && git commit -m init && git tag v0.1.0
    git push --tags

## 2. Host pack.toml

Anything that serves the repo over HTTP. You already have a box with a
public IP, so nginx on it is enough:

    services.nginx.virtualHosts."mc.example.com".locations."/" = {
      root = "/srv/pack";
    };

GitHub raw works too, using the tag:

    https://github.com/you/cozy-create/raw/v0.1.0/pack.toml

## 3. Server

In `/etc/nixos`, you need the nix-minecraft module alongside this one.
Channel-based config can pull a flake input with `builtins.getFlake`, or
switch that host to a flake. Then:

    services.cozyCreate = {
      enable = true;
      packUrl = "https://github.com/you/cozy-create/raw/v0.1.0/pack.toml";
      # build once with the default, copy the real hash out of the error
      packHash = "sha256-AAAA...";
      neoforgeVersion = "21.1.209";   # must match pack.toml
      jvmOpts = "-Xms8G -Xmx8G -XX:+UseG1GC";
    };

Console is a tmux socket:

    tmux -S /run/minecraft/cozy-create.sock attach

## 4. Friend

    nix run .#instance -- https://mc.example.com/pack.toml "Cozy Create"

Sends them `friend-instance.zip`. They install Prism, add their Microsoft
account, Add Instance, Import from zip, launch, connect to your IP.

Every launch after that, the pre-launch hook re-syncs from your
`pack.toml`. You never send them a second file.

## 5. Updating

    packwiz cf update --all
    packwiz refresh
    git commit -am "bump" && git tag v0.2.0 && git push --tags

Then bump `packUrl` and blank `packHash` back to `lib.fakeHash`,
rebuild, copy the new hash in. Friend picks it up on next launch.

## Gotchas

- `neoforgeVersion` in the module, the version in `mmc-pack.json` inside
  the instance zip, and the loader version in `pack.toml` all have to
  agree. Mismatch shows up as a client/server handshake failure.
- Client-only mods (Sound Physics, Presence Footsteps, shaders) should be
  marked client-side in their `.pw.toml` so the server does not try to
  load them. packwiz usually detects this; check the ones that matter.
- Leave `server-ip` empty. Binding it to the LAN address is why a correct
  port forward can still refuse connections.
- Test from outside your network before telling anyone it works. Inside
  the LAN, the public IP may resolve fine while the forward is broken.
