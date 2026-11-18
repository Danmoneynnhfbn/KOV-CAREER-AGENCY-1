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

# Open the homepage's primary Private Career Representation destination, then
# use Android Back to verify WebView history is handled inside the app.
adb shell input tap 540 960
sleep 8
adb exec-out screencap -p > "$SCREENSHOT_DIR/03-kov-service-navigation.png"
adb shell input keyevent 4
sleep 5
adb exec-out screencap -p > "$SCREENSHOT_DIR/04-kov-back-navigation.png"

test -s "$SCREENSHOT_DIR/03-kov-service-navigation.png"
test -s "$SCREENSHOT_DIR/04-kov-back-navigation.png"

# Ignore the Android status/navigation bars and confirm both transitions changed
# actual page pixels. This prevents a successful test with a tap that missed.
python3 - "$SCREENSHOT_DIR" <<'PY'
import sys
from pathlib import Path
from PIL import Image, ImageChops, ImageStat

folder = Path(sys.argv[1])
pairs = [
    ("02-kov-home-content.png", "03-kov-service-navigation.png", "CTA tap did not change the page."),
    ("03-kov-service-navigation.png", "04-kov-back-navigation.png", "Android Back did not change the page."),
]
for first, second, message in pairs:
    a = Image.open(folder / first).convert("RGB")
    b = Image.open(folder / second).convert("RGB")
    if a.size != b.size:
        raise SystemExit(f"Screenshot sizes differ: {first} {a.size}, {second} {b.size}")
    # Crop system status and navigation bars; compare the website content area.
    box = (0, 70, a.width, a.height - 90)
    diff = ImageChops.difference(a.crop(box), b.crop(box))
    mean_change = sum(ImageStat.Stat(diff).mean) / 3
    print(f"{first} -> {second}: mean pixel change {mean_change:.2f}")
    if mean_change < 2.0:
        raise SystemExit(message)

# After Back, the app must still be running and in the foreground.
adb_focus_placeholder = True
PY

FOCUS_AFTER_BACK="$(adb shell dumpsys activity activities | grep -E -m4 'ResumedActivity|topResumedActivity|mCurrentFocus' || true)"
WINDOW_AFTER_BACK="$(adb shell dumpsys window | grep -E -m2 'mCurrentFocus|mFocusedApp' || true)"
if ! printf '%s\\n%s' "$FOCUS_AFTER_BACK" "$WINDOW_AFTER_BACK" | grep -q 'com.kovcareeragency.app'; then
  echo "KOV app left the foreground after Back navigation." >&2
  exit 1
fi

adb shell pidof com.kovcareeragency.app
echo "KOV app is foreground, no KOV process crash/ANR, scroll, CTA navigation and Android Back verified."
