{
  description = "Create-focused 1.21.1 modpack: packwiz source of truth, NeoForge server, Prism client";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    nix-minecraft.url = "github:Infinidoge/nix-minecraft";
    nix-minecraft.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = { self, nixpkgs, nix-minecraft }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" ];
      forAllSystems = f:
        nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
    in
    {
      # nix develop  ->  packwiz and friends on PATH
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = with pkgs; [ packwiz jq curl zip unzip ];
          shellHook = ''
            echo "packwiz $(packwiz --version 2>/dev/null || echo '(installed)')"
            echo "first run:  ./add-mods.sh"
            echo "after edits: packwiz refresh && git commit && git push"
          '';
        };
      });

      # nix run .#instance -- https://your.host/pack.toml
      #   -> friend-instance.zip, importable in Prism, self-updating on every launch
      packages = forAllSystems (pkgs: {
        instance = pkgs.writeShellApplication {
          name = "make-instance";
          runtimeInputs = with pkgs; [ curl zip coreutils gnused ];
          text = builtins.readFile ./make-instance.sh;
        };
        default = self.packages.${pkgs.system}.instance;
      });

      # Import into /etc/nixos. Needs the nix-minecraft module + overlay, see README.
      nixosModules.default = { config, lib, pkgs, ... }:
        let cfg = config.services.cozyCreate;
        in {
          options.services.cozyCreate = {
            enable = lib.mkEnableOption "Create modpack server";

            packUrl = lib.mkOption {
              type = lib.types.str;
              description = ''
                Raw URL to pack.toml, pinned to a tag or commit.
                A moving URL changes the derivation hash on every push.
              '';
              example = "https://github.com/you/cozy-create/raw/v0.1.0/pack.toml";
            };

            packHash = lib.mkOption {
              type = lib.types.str;
              default = lib.fakeHash;
              description = "Build once with the default, take the hash from the error.";
            };

            neoforgeVersion = lib.mkOption {
              type = lib.types.str;
              default = "21.1.250";
              description = "Must match the loader version in pack.toml.";
            };

            jvmOpts = lib.mkOption {
              type = lib.types.str;
              default = "-Xms8G -Xmx8G -XX:+UseG1GC";
              description = ''
                Heap, not the whole box. Bigger heap means longer GC pauses,
                which is what most "lag spikes" actually are.
              '';
            };

            port = lib.mkOption {
              type = lib.types.port;
              default = 25565;
            };

            openFirewall = lib.mkOption {
              type = lib.types.bool;
              default = true;
            };
          };

          config = lib.mkIf cfg.enable (
            let
              modpack = pkgs.fetchPackwizModpack {
                url = cfg.packUrl;
                packHash = cfg.packHash;
              };
            in
            {
              nixpkgs.overlays = [ nix-minecraft.overlay ];

              services.minecraft-servers = {
                enable = true;
                eula = true;
                openFirewall = cfg.openFirewall;

                servers.cozy-create = {
                  enable = true;

                  package = pkgs.neoforgeServers."neoforge-1_21_1".override {
                    loaderVersion = cfg.neoforgeVersion;
                  };

                  jvmOpts = cfg.jvmOpts;

                  # mods comes straight from the same pack.toml the client syncs
                  symlinks."mods" = "${modpack}/mods";
                  files."config" = "${modpack}/config";

                  serverProperties = {
                    server-port = cfg.port;
                    # Leave server-ip empty. Setting it binds to one interface
                    # and the port forward stops reaching the server.
                    server-ip = "";
                    motd = "cogs are turning";
                    difficulty = "normal";
                    max-players = 8;
                    view-distance = 10;
                    simulation-distance = 8;
                    enable-rcon = true;
                    "rcon.port" = 25575;
                  };
                };
              };
            }
          );
        };
    };
}
