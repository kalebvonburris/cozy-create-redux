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
          server = pkgs.writeShellApplication {
            name = "cozy-server";
            runtimeInputs = [ pkgs.jdk21 ];
            text = ''
              dir="''${1:-./server}"
              mkdir -p "$dir" && cd "$dir"
              [ -f eula.txt ] || echo "eula=true" > eula.txt
              exec java -Xms10G -Xmx10G -XX:+UseG1GC \
                @./libraries/net/neoforged/neoforge/21.1.250/unix_args.txt nogui
            '';
          };
      });
    };
}
