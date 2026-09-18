# usage: nix run .#instance -- <PACK_TOML_URL> [INSTANCE_NAME]
#
# Builds friend-instance.zip. They install Prism, Add Instance,
# Import from zip, and launch. Every launch after that it re-syncs
# from your pack.toml on its own. You never send them a file again.

if [ $# -lt 1 ]; then
  echo "usage: make-instance <PACK_TOML_URL> [INSTANCE_NAME]" >&2
  echo "  e.g. make-instance https://mc.example.com/pack.toml 'Cozy Create'" >&2
  exit 1
fi

pack_url="$1"
name="${2:-Cozy Create}"

case "$pack_url" in
http://* | https://*) ;;
*)
  echo "make-instance: pack url must be http(s)" >&2
  exit 1
  ;;
esac

case "$pack_url" in
*pack.toml) ;;
*) echo "make-instance: warning, url does not end in pack.toml" >&2 ;;
esac

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

mc="$work/.minecraft"
mkdir -p "$mc"

# The bootstrap jar is tiny and self-updating; it pulls the real
# packwiz-installer on first run.
boot_url="https://github.com/packwiz/packwiz-installer-bootstrap/releases/latest/download/packwiz-installer-bootstrap.jar"
echo "fetching packwiz-installer-bootstrap"
curl -sSfL -o "$mc/packwiz-installer-bootstrap.jar" "$boot_url"

# Prism reads the loader stack from here. The NeoForge version must match
# what packwiz wrote into pack.toml, or the client and server disagree.
cat >"$work/mmc-pack.json" <<'JSON'
{
    "components": [
        {
            "cachedName": "Minecraft",
            "important": true,
            "uid": "net.minecraft",
            "version": "1.21.1"
        },
        {
            "cachedName": "NeoForge",
            "cachedRequires": [
                {
                    "equals": "1.21.1",
                    "uid": "net.minecraft"
                }
            ],
            "uid": "net.neoforged",
            "version": "21.1.250"
        }
    ],
    "formatVersion": 1
}
JSON

# OverrideCommands plus PreLaunchCommand is the whole auto-update mechanism.
# $INST_JAVA and $INST_MC_DIR are substituted by Prism at launch, not here.
cat >"$work/instance.cfg" <<CFG
InstanceType=OneSix
name=$name
notes=Syncs from $pack_url on every launch. Do not add mods by hand, they get removed.
OverrideCommands=true
PreLaunchCommand="\$INST_JAVA" -jar packwiz-installer-bootstrap.jar -g -s client "$pack_url"
OverrideMemory=true
MinMemAlloc=4096
MaxMemAlloc=8192
OverrideJavaArgs=false
CFG

out="$PWD/friend-instance.zip"
rm -f "$out"
(cd "$work" && zip -qr "$out" .)

echo "wrote $out ($(du -h "$out" | cut -f1))"
echo
echo "send that to your friend. they:"
echo "  1. install Prism Launcher"
echo "  2. add their Microsoft account"
echo "  3. Add Instance -> Import from zip"
echo "  4. launch, then connect to your IP"
