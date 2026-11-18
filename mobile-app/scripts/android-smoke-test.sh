#!/usr/bin/env bash
set -euo pipefail

WORKSPACE="${GITHUB_WORKSPACE:?GITHUB_WORKSPACE is required}"
APK_PATH="$(find "$WORKSPACE/artifacts/android" -type f -name app-debug.apk -print -quit)"

if [[ -z "$APK_PATH" ]]; then
  echo "Debug APK was not found under $WORKSPACE/artifacts/android" >&2
  find "$WORKSPACE/artifacts/android" -maxdepth 8 -type f -print >&2 || true
  exit 1
fi

echo "Installing: $APK_PATH"
adb wait-for-device
adb install "$APK_PATH"
adb shell wm size 1080x1920
adb shell wm density 420
adb shell monkey -p com.kovcareeragency.app 1
sleep 25

SCREENSHOT_DIR="$WORKSPACE/mobile-app/assets/play-store/screenshots"
mkdir -p "$SCREENSHOT_DIR"
adb exec-out screencap -p > "$SCREENSHOT_DIR/01-kov-home.png"
adb shell input swipe 540 1600 540 500 500
sleep 4
adb exec-out screencap -p > "$SCREENSHOT_DIR/02-kov-home-content.png"

test -s "$SCREENSHOT_DIR/01-kov-home.png"
test -s "$SCREENSHOT_DIR/02-kov-home-content.png"
adb shell pidof com.kovcareeragency.app
echo "Android app installed and screenshots captured."
