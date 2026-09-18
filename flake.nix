{
  description = "Cozy Create Redux: packwiz is the source of truth, nix builds pinned client and server outputs";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }:
    let
      lib = nixpkgs.lib;
      systems = [ "x86_64-linux" "aarch64-linux" ];
      forAllSystems = f:
        lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});

      # ---- packwiz metadata, read at eval time -------------------------------

      pack = builtins.fromTOML (builtins.readFile ./pack.toml);
      mcVersion = pack.versions.minecraft;
      neoVersion = pack.versions.neoforge;

      # Where the built client re-syncs from on every launch. A branch ref
      # means players track main; a tag ref pins them until you move it.
      packUrl =
        "https://github.com/kalebvonburris/cozy-create-redux/raw/main/pack.toml";

      # parse every *.pw.toml in a directory
      readPwTomls = dir:
        if !builtins.pathExists dir then [ ]
        else
          let
            names = builtins.filter (n: lib.hasSuffix ".pw.toml" n)
              (builtins.attrNames (builtins.readDir dir));
          in
          map (n: builtins.fromTOML (builtins.readFile (dir + "/${n}"))) names;

      mods =
        let
          all = readPwTomls ./mods;
          counts = lib.foldl'
            (acc: m: acc // { ${m.filename} = (acc.${m.filename} or 0) + 1; }) { } all;
          dupes = builtins.attrNames (lib.filterAttrs (_: c: c > 1) counts);
        in
        if dupes == [ ] then all
        else throw "duplicate filenames in mods/: ${lib.concatStringsSep ", " dupes}";

      # packwiz files a shaderpack outside mods/ because it is not a mod.
      # client-only by definition; the server build never sees these.
      shaders = readPwTomls ./shaderpacks;

      # "both" is packwiz's default when side is omitted
      sideOf = m: m.side or "both";
      forSide = side: builtins.filter (m: sideOf m == "both" || sideOf m == side) mods;

      # CurseForge entries carry no URL, only a file id. The CDN path is
      # files/<id div 1000>/<id mod 1000>/<filename>, unpadded. Verified
      # against packwiz's recorded sha1 for Create 6.0.10.
      urlEncode = builtins.replaceStrings
        [ " " "+" "'" "[" "]" "(" ")" ]
        [ "%20" "%2B" "%27" "%5B" "%5D" "%28" "%29" ];

      cfUrl = m:
        let
          id = m.update.curseforge.file-id;
          hi = id / 1000;
          lo = id - 1000 * hi;
        in
        "https://edge.forgecdn.net/files/${toString hi}/${toString lo}/${urlEncode m.filename}";

      modUrl = m: m.download.url or (cfUrl m);

      # packwiz records sha1 for CurseForge and sha512 for Modrinth.
      # fetchurl accepts either as a named attribute, so pass it through.
      fetchMod = pkgs: m:
        pkgs.fetchurl ({
          url = modUrl m;
          name = lib.strings.sanitizeDerivationName m.filename;
        } // { "${m.download.hash-format}" = m.download.hash; });

      # a directory of real, writable files (not symlinks) so it zips cleanly.
      # install -m644 rather than cp: fetched store paths are 444, and cp
      # inheriting that mode is what makes a duplicate filename fail with
      # "Permission denied" instead of something legible.
      fetchDir = pkgs: name: entries:
        pkgs.runCommand name { } ''
          mkdir -p "$out"
          ${lib.concatMapStringsSep "\n"
            (m: ''install -m644 ${fetchMod pkgs m} "$out/${m.filename}"'')
            entries}
        '';

      modsDir = pkgs: side: fetchDir pkgs "mods-${side}" (forSide side);
      shadersDir = pkgs: fetchDir pkgs "shaderpacks" shaders;

      # pack-level files packwiz tracks alongside mods, copied if present
      copyIfPresent = rel: dest:
        lib.optionalString (builtins.pathExists (./. + "/${rel}"))
          ''cp -r ${./. + "/${rel}"} "${dest}"'';

      # Runs before the game starts, inside the instance. Reads packUrl,
      # adds what is new, removes what is gone, then launches. This is the
      # only thing that makes an imported zip self-updating; a zip alone is
      # frozen at build time.
      packwizBootstrap = pkgs: pkgs.fetchurl {
        url = "https://github.com/packwiz/packwiz-installer-bootstrap/releases/download/v0.0.3/packwiz-installer-bootstrap.jar";
        hash = "sha256-qPuyTcYEJ46X9GiOgtPZGjGLmO/AjV2/y8vKtkQ9EWw=";
      };

      neoInstaller = pkgs: pkgs.fetchurl {
        url = "https://maven.neoforged.net/releases/net/neoforged/neoforge/${neoVersion}/neoforge-${neoVersion}-installer.jar";
        # pinned for 21.1.250; bump this when you bump pack.toml
        hash = "sha256-DkepG6ITmo20v3Ynrwgfe1eJtQi7A57o3qEnK3lpPWA=";
      };
    in
    {
      packages = forAllSystems (pkgs: rec {

        # nix build .#client  ->  a Prism instance. zip it, Import from zip.
        client = pkgs.runCommand "cozy-create-client" { } ''
          mkdir -p "$out/.minecraft"
          cp -r ${modsDir pkgs "client"} "$out/.minecraft/mods"
          install -m644 ${packwizBootstrap pkgs} \
            "$out/.minecraft/packwiz-installer-bootstrap.jar"
          ${copyIfPresent "config" "$out/.minecraft/config"}
          ${copyIfPresent "kubejs" "$out/.minecraft/kubejs"}
          ${copyIfPresent "resourcepacks" "$out/.minecraft/resourcepacks"}
          ${lib.optionalString (shaders != [ ])
            ''cp -r ${shadersDir pkgs} "$out/.minecraft/shaderpacks"''}

          cat > "$out/mmc-pack.json" <<EOF
          {
            "formatVersion": 1,
            "components": [
              { "uid": "net.minecraft", "version": "${mcVersion}", "important": true },
              { "uid": "net.neoforged", "version": "${neoVersion}",
                "cachedRequires": [ { "uid": "net.minecraft", "equals": "${mcVersion}" } ] }
            ]
          }
          EOF

          cat > "$out/instance.cfg" <<'EOF'
          InstanceType=OneSix
          name=@NAME@
          notes=Re-syncs from @PACKURL@ on every launch. Mods added by hand get removed.
          OverrideCommands=true
          PreLaunchCommand="$INST_JAVA" -jar packwiz-installer-bootstrap.jar -g -s client @PACKURL@
          OverrideMemory=true
          MinMemAlloc=4096
          MaxMemAlloc=8192
          EOF
          # $INST_JAVA is substituted by Prism at launch, so the heredoc above
          # is quoted to keep it literal; the real values go in after.
          substituteInPlace "$out/instance.cfg" \
            --replace '@NAME@' '${pack.name} ${pack.version}' \
            --replace '@PACKURL@' '${packUrl}'
        '';

        # nix build .#server  ->  server files. unzip, ./start.sh.
        server = pkgs.runCommand "cozy-create-server" { } ''
          mkdir -p "$out"
          cp -r ${modsDir pkgs "server"} "$out/mods"
          ${copyIfPresent "config" "$out/config"}
          ${copyIfPresent "kubejs" "$out/kubejs"}
          cp ${neoInstaller pkgs} "$out/neoforge-installer.jar"

          cat > "$out/start.sh" <<'EOF'
          #!/usr/bin/env bash
          set -euo pipefail
          cd "$(dirname "$0")"

          if [ ! -d libraries ]; then
            echo "first run: installing NeoForge ${neoVersion}"
            java -jar neoforge-installer.jar --installServer
          fi

          if [ ! -f eula.txt ] || ! grep -q '^eula=true' eula.txt; then
            echo "accept Mojang's EULA to continue:"
            echo "  echo eula=true > eula.txt"
            exit 1
          fi

          read -ra jvm <<< "''${JVM_OPTS:--Xms8G -Xmx8G -XX:+UseG1GC}"
          exec java "''${jvm[@]}" \
            @libraries/net/neoforged/neoforge/${neoVersion}/unix_args.txt nogui
          EOF
          chmod +x "$out/start.sh"

          echo "${pack.name} ${pack.version} / mc ${mcVersion} / neoforge ${neoVersion}" > "$out/VERSION"
        '';

        # nix run .#run-server [DIR]  ->  syncs the build into a mutable dir and starts it.
        # mods and installer are replaced every run; world, config, eula, logs are kept.
        run-server = pkgs.writeShellApplication {
          name = "cozy-server";
          runtimeInputs = [ pkgs.jdk21 pkgs.coreutils ];
          text = ''
            dir="''${1:-./server}"
            src=${server}
            mkdir -p "$dir"
            rm -rf "$dir/mods"
            cp -r "$src/mods" "$dir/mods"
            cp "$src/neoforge-installer.jar" "$src/start.sh" "$src/VERSION" "$dir/"
            for d in config kubejs; do
              if [ -d "$src/$d" ] && [ ! -d "$dir/$d" ]; then cp -r "$src/$d" "$dir/$d"; fi
            done
            chmod -R u+w "$dir"
            cd "$dir" && exec ./start.sh
          '';
        };

        default = client;
      });

      apps = forAllSystems (pkgs: {
        server = {
          type = "app";
          program = "${self.packages.${pkgs.system}.run-server}/bin/cozy-server";
        };
      });

      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = with pkgs; [ packwiz jq curl zip unzip ];
        };
      });
    };
}
