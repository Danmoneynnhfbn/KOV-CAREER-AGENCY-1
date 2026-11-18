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
sleep 25

SCREENSHOT_DIR="$WORKSPACE/mobile-app/assets/play-store/screenshots"
mkdir -p "$SCREENSHOT_DIR"

# Avoid a full UIAutomator hierarchy dump: large WebView pages can make that
# diagnostic command stall. Check the actual foreground activity and app logs.
FOCUS="$(adb shell dumpsys activity activities | grep -E -m4 'ResumedActivity|topResumedActivity|mCurrentFocus' || true)"
WINDOW_FOCUS="$(adb shell dumpsys window | grep -E -m2 'mCurrentFocus|mFocusedApp' || true)"
echo "Activity focus: $FOCUS"
echo "Window focus: $WINDOW_FOCUS"
if ! printf '%s\n%s' "$FOCUS" "$WINDOW_FOCUS" | grep -q 'com.kovcareeragency.app'; then
  echo "KOV app is not reported as the foreground activity." >&2
  adb shell dumpsys activity top | tail -100 >&2 || true
  adb logcat -d -t 2500 | grep -Ei 'ANR in|FATAL EXCEPTION|Process .*kovcareeragency' | tail -80 >&2 || true
  exit 1
fi

# Fail only for an app-process crash/ANR, not a separate Android launcher warning.
APP_ERRORS="$(adb logcat -d -t 3000 | grep -Ei 'ANR in com\\.kovcareeragency\\.app|FATAL EXCEPTION.*kovcareeragency|Process com\\.kovcareeragency\\.app.*died' || true)"
if [[ -n "$APP_ERRORS" ]]; then
  echo "KOV app runtime error detected:" >&2
  echo "$APP_ERRORS" >&2
  exit 1
fi

adb exec-out screencap -p > "$SCREENSHOT_DIR/01-kov-home.png"

# Scroll the live website and retain a second genuine screenshot for visual review.
adb shell input swipe 540 1600 540 500 700
sleep 5
adb exec-out screencap -p > "$SCREENSHOT_DIR/02-kov-home-content.png"

test -s "$SCREENSHOT_DIR/01-kov-home.png"
test -s "$SCREENSHOT_DIR/02-kov-home-content.png"
if cmp -s "$SCREENSHOT_DIR/01-kov-home.png" "$SCREENSHOT_DIR/02-kov-home-content.png"; then
  echo "The page did not visibly change after the scroll gesture." >&2
  exit 1
fi

adb shell pidof com.kovcareeragency.app
echo "KOV app is foreground, no KOV process crash/ANR, screenshots captured."
