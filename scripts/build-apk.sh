#!/usr/bin/env bash
# Builds a signed Android package that wraps the installed web app (a Trusted Web Activity).
# The launcher icon is the Mr. Nook pixel sprite from the web manifest.
#
# Needs a JDK and the Android SDK. Point JAVA_HOME and ANDROID_HOME at them, or let the
# script pick up a local toolchain under .toolchain/.
#
#   ./scripts/build-apk.sh
#
# The signing keystore lives in .secrets/ and is NOT in git. Keep it: Android only accepts
# updates signed with the same key. Losing it means Katie has to uninstall and reinstall.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"

HOST="${HOST:-mr-nook.yannicklanzrath.workers.dev}"
PKG="${PKG:-dev.workers.mrnook}"
BUILD_DIR="${BUILD_DIR:-$ROOT/apk-build}"
KEYSTORE="$ROOT/.secrets/android-keystore.jks"
ALIAS="mrnook"

: "${JAVA_HOME:=$ROOT/.toolchain/jdk/Contents/Home}"
: "${ANDROID_HOME:=$ROOT/.toolchain/sdk}"
# bubblewrap rejects paths containing symlinks or ".." segments.
JAVA_HOME="$(cd "$JAVA_HOME" && pwd -P)"
ANDROID_HOME="$(cd "$ANDROID_HOME" && pwd -P)"
JDK_ROOT="$(cd "$JAVA_HOME/../.." && pwd -P)"
export JAVA_HOME ANDROID_HOME
[ -x "$JAVA_HOME/bin/java" ] || { echo "No JDK at $JAVA_HOME. Set JAVA_HOME."; exit 1; }
[ -d "$ANDROID_HOME/platforms" ] || { echo "No Android SDK at $ANDROID_HOME. Set ANDROID_HOME."; exit 1; }
export PATH="$JAVA_HOME/bin:$PATH"

# bubblewrap expects the pre-2021 SDK layout with a "tools" folder at the root. Linking the
# whole cmdline-tools folder keeps sdkmanager's own lib lookup intact; linking only "bin"
# breaks it.
rm -f "$ANDROID_HOME/bin"
if [ ! -e "$ANDROID_HOME/tools" ] && [ -d "$ANDROID_HOME/cmdline-tools/latest" ]; then
  ln -sfn "$ANDROID_HOME/cmdline-tools/latest" "$ANDROID_HOME/tools"
fi

mkdir -p "$ROOT/.secrets" "$BUILD_DIR"

echo "== signing key"
if [ ! -f "$KEYSTORE" ]; then
  [ -s "$ROOT/.secrets/android-keystore-password" ] || openssl rand -hex 20 > "$ROOT/.secrets/android-keystore-password"
  PASS="$(cat "$ROOT/.secrets/android-keystore-password")"
  keytool -genkeypair -v -keystore "$KEYSTORE" -alias "$ALIAS" \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass "$PASS" -keypass "$PASS" \
    -dname "CN=Mr. Nook, OU=Private, O=Mr. Nook, L=-, ST=-, C=DE" >/dev/null 2>&1
  echo "  created $KEYSTORE"
else
  echo "  reusing $KEYSTORE"
fi
PASS="$(cat "$ROOT/.secrets/android-keystore-password")"
export BUBBLEWRAP_KEYSTORE_PASSWORD="$PASS" BUBBLEWRAP_KEY_PASSWORD="$PASS"

echo "== bubblewrap config"
mkdir -p "$HOME/.bubblewrap"
cat > "$HOME/.bubblewrap/config.json" <<EOF
{"jdkPath":"$JDK_ROOT","androidSdkPath":"$ANDROID_HOME"}
EOF

echo "== project"
cat > "$BUILD_DIR/twa-manifest.json" <<EOF
{
  "packageId": "$PKG",
  "host": "$HOST",
  "name": "Mr. Nook",
  "launcherName": "Mr. Nook",
  "display": "standalone",
  "themeColor": "#fcf3e3",
  "themeColorDark": "#2a1d15",
  "navigationColor": "#fcf3e3",
  "navigationColorDark": "#2a1d15",
  "navigationDividerColor": "#e9dbc2",
  "navigationDividerColorDark": "#503c2e",
  "backgroundColor": "#fcf3e3",
  "enableNotifications": false,
  "startUrl": "/#/home",
  "iconUrl": "https://$HOST/icons/icon-512.png",
  "maskableIconUrl": "https://$HOST/icons/icon-512-maskable.png",
  "splashScreenFadeOutDuration": 300,
  "signingKey": { "path": "$KEYSTORE", "alias": "$ALIAS" },
  "appVersionName": "${APP_VERSION:-1.0.0}",
  "appVersionCode": ${APP_VERSION_CODE:-1},
  "shortcuts": [],
  "generatorApp": "bubblewrap-cli",
  "webManifestUrl": "https://$HOST/manifest.webmanifest",
  "fallbackType": "customtabs",
  "features": {},
  "alphaDependencies": { "enabled": false },
  "enableSiteSettingsShortcut": true,
  "isChromeOSOnly": false,
  "isMetaQuest": false,
  "fullScopeUrl": "https://$HOST/",
  "minSdkVersion": 23,
  "orientation": "portrait",
  "fingerprints": []
}
EOF

cd "$BUILD_DIR"
echo "== generate android project"
npx --yes @bubblewrap/cli@1 update --skipVersionUpgrade 2>&1 | tail -5

echo "== icon background"
# The generated adaptive icon puts white under the artwork, which shows as a pale rim on
# square launchers. Our maskable icon is cream, so the layer underneath should be too.
COLORS="$BUILD_DIR/app/src/main/res/values/colors.xml"
ADAPTIVE="$BUILD_DIR/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml"
if [ -f "$COLORS" ] && ! grep -q "icon_background" "$COLORS"; then
  /usr/bin/sed -i '' 's#</resources>#    <color name="icon_background">\#fcf3e3</color>\
</resources>#' "$COLORS"
fi
[ -f "$ADAPTIVE" ] && /usr/bin/sed -i '' 's#@android:color/white#@color/icon_background#' "$ADAPTIVE"

echo "== build"
npx --yes @bubblewrap/cli@1 build --skipPwaValidation 2>&1 | tail -8

APK="$BUILD_DIR/app-release-signed.apk"
[ -f "$APK" ] || { echo "APK not produced"; exit 1; }

echo "== publish"
mkdir -p "$ROOT/public/app"
cp "$APK" "$ROOT/public/app/mr-nook.apk"
ls -lh "$ROOT/public/app/mr-nook.apk" | awk '{print "  public/app/mr-nook.apk", $5}'

echo "== digital asset links"
FP="$(keytool -list -v -keystore "$KEYSTORE" -alias "$ALIAS" -storepass "$PASS" 2>/dev/null | awk -F': ' '/SHA256:/{print $2; exit}')"
mkdir -p "$ROOT/public/.well-known"
cat > "$ROOT/public/.well-known/assetlinks.json" <<EOF
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "$PKG",
    "sha256_cert_fingerprints": ["$FP"]
  }
}]
EOF
echo "  fingerprint $FP"
echo "done"
