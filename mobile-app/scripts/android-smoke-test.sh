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

# Dump the system UI and, if Android displays the Quickstep ANR dialog, click
# the actual accessible "Wait" button using its reported bounds. This avoids
# brittle hard-coded taps and distinguishes a launcher warning from an app crash.
dump_ui() {
  adb shell uiautomator dump /sdcard/kov-window.xml >/dev/null 2>&1 || true
  adb shell cat /sdcard/kov-window.xml 2>/dev/null | tr -d '\r' > "$SCREENSHOT_DIR/window.xml"
}

dump_ui
if grep -qi "Quickstep isn't responding" "$SCREENSHOT_DIR/window.xml"; then
  echo "Quickstep launcher ANR dialog detected; requesting Wait via UI hierarchy."
  WAIT_BOUNDS="$(python3 - "$SCREENSHOT_DIR/window.xml" <<'PY'
import re, sys, xml.etree.ElementTree as ET
try:
    root = ET.parse(sys.argv[1]).getroot()
except Exception:
    print("")
    raise SystemExit(0)
for node in root.iter("node"):
    if node.attrib.get("text", "").strip().lower() == "wait" and node.attrib.get("clickable") == "true":
        print(node.attrib.get("bounds", ""))
        break
PY
)"
  if [[ "$WAIT_BOUNDS" =~ \[([0-9]+),([0-9]+)\]\[([0-9]+),([0-9]+)\] ]]; then
    X=$(( ( ${BASH_REMATCH[1]} + ${BASH_REMATCH[3]} ) / 2 ))
    Y=$(( ( ${BASH_REMATCH[2]} + ${BASH_REMATCH[4]} ) / 2 ))
    adb shell input tap "$X" "$Y"
  else
    echo "Wait button bounds not available; do not tap arbitrary screen coordinates." >&2
    cat "$SCREENSHOT_DIR/window.xml" >&2
    exit 1
  fi
  sleep 10
  dump_ui
fi

if grep -qi "Quickstep isn't responding" "$SCREENSHOT_DIR/window.xml"; then
  echo "Quickstep launcher ANR dialog remains visible." >&2
  exit 1
fi

# Verify that KOV content, rather than a launcher/error screen, is accessible.
if ! grep -Eqi "KOV Career Agency|KOV / PRIVATE CAREER REPRESENTATION|Search KOV directory" "$SCREENSHOT_DIR/window.xml"; then
  echo "KOV website content was not exposed in the Android accessibility tree." >&2
  cat "$SCREENSHOT_DIR/window.xml" >&2
  exit 1
fi

FOCUS="$(adb shell dumpsys activity activities | grep -E -m2 'ResumedActivity|topResumedActivity|mCurrentFocus' || true)"
WINDOW_FOCUS="$(adb shell dumpsys window | grep -E -m1 'mCurrentFocus|mFocusedApp' || true)"
echo "Activity focus: $FOCUS"
echo "Window focus: $WINDOW_FOCUS"
if ! printf '%s\n%s' "$FOCUS" "$WINDOW_FOCUS" | grep -q 'com.kovcareeragency.app'; then
  echo "KOV app is not reported as the foreground activity." >&2
  adb shell dumpsys activity top | tail -80 >&2 || true
  exit 1
fi

adb exec-out screencap -p > "$SCREENSHOT_DIR/01-kov-home.png"

# Scroll the live website and retain a second genuine screenshot.
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
echo "KOV app is foreground; no launcher ANR; KOV page content and scrolling verified."
