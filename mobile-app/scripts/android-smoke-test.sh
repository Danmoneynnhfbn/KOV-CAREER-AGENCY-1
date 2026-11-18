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
adb install -r "$APK_PATH"
adb shell wm size 1080x1920
adb shell wm density 420
adb shell monkey -p com.kovcareeragency.app 1
sleep 20

# The hosted emulator has occasionally raised an ANR for Android's Quickstep
# launcher (not KOV). Wait for the system launcher instead of capturing its
# modal over the app, then verify KOV remains the foreground activity.
adb shell uiautomator dump /sdcard/kov-window.xml >/dev/null 2>&1 || true
if adb shell cat /sdcard/kov-window.xml | grep -qi "Quickstep isn't responding"; then
  echo "Android Quickstep launcher ANR detected; waiting for system launcher."
  adb shell input tap 500 1110
  sleep 8
  adb shell uiautomator dump /sdcard/kov-window.xml >/dev/null 2>&1 || true
fi

if adb shell cat /sdcard/kov-window.xml | grep -qi "Quickstep isn't responding"; then
  echo "System launcher ANR dialog remains visible; emulator screenshot is not valid." >&2
  exit 1
fi

FOCUS="$(adb shell dumpsys activity activities | grep -m1 'mResumedActivity' || true)"
echo "Foreground activity: $FOCUS"
if ! printf '%s' "$FOCUS" | grep -q 'com.kovcareeragency.app'; then
  echo "KOV app is not the foreground activity." >&2
  exit 1
fi

SCREENSHOT_DIR="$WORKSPACE/mobile-app/assets/play-store/screenshots"
mkdir -p "$SCREENSHOT_DIR"
adb exec-out screencap -p > "$SCREENSHOT_DIR/01-kov-home.png"

# Scroll the page and confirm that the visible screen actually changes.
adb shell input swipe 540 1600 540 500 700
sleep 3
adb exec-out screencap -p > "$SCREENSHOT_DIR/02-kov-home-content.png"

test -s "$SCREENSHOT_DIR/01-kov-home.png"
test -s "$SCREENSHOT_DIR/02-kov-home-content.png"
if cmp -s "$SCREENSHOT_DIR/01-kov-home.png" "$SCREENSHOT_DIR/02-kov-home-content.png"; then
  echo "The page did not visibly change after the scroll gesture." >&2
  exit 1
fi

adb shell pidof com.kovcareeragency.app
echo "Android app foreground, launcher dialog clear, and scroll screenshots captured."
