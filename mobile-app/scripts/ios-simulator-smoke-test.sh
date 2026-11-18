#!/usr/bin/env bash
set -euo pipefail

WORKSPACE="${GITHUB_WORKSPACE:?GITHUB_WORKSPACE is required}"
APP_PATH="$WORKSPACE/mobile-app/ios/App/build/Build/Products/Debug-iphonesimulator/App.app"
SCREENSHOT_DIR="$WORKSPACE/mobile-app/assets/app-store/ios-screenshots"
BUNDLE_ID="com.kovcareeragency.app"

if [[ ! -d "$APP_PATH" ]]; then
  echo "iOS simulator app was not found: $APP_PATH" >&2
  exit 1
fi

echo "Available iPhone simulators:"
xcrun simctl list devices available | grep -E 'iPhone|-- iOS' || true
DEVICE_ID="$(xcrun simctl list devices available | sed -n '/iPhone/ s/.*(\([A-Fa-f0-9-]\{36\}\)).*/\1/p' | head -1)"
if [[ -z "$DEVICE_ID" ]]; then
  echo "No available iPhone simulator device was found." >&2
  xcrun simctl list devices available >&2
  exit 1
fi

echo "Selected iPhone simulator: $DEVICE_ID"
xcrun simctl boot "$DEVICE_ID" 2>/dev/null || true
if ! timeout 180s xcrun simctl bootstatus "$DEVICE_ID" -b; then
  echo "iPhone simulator did not finish booting within 180 seconds." >&2
  xcrun simctl list devices >&2
  exit 1
fi

echo "Installing KOV app in the booted simulator."
timeout 60s xcrun simctl install "$DEVICE_ID" "$APP_PATH"
echo "Launching KOV app."
timeout 60s xcrun simctl launch "$DEVICE_ID" "$BUNDLE_ID"
sleep 20

mkdir -p "$SCREENSHOT_DIR"
timeout 30s xcrun simctl io "$DEVICE_ID" screenshot "$SCREENSHOT_DIR/01-kov-iphone-home.png"
CONTAINER="$(xcrun simctl get_app_container "$DEVICE_ID" "$BUNDLE_ID" app)"
if [[ -z "$CONTAINER" || ! -d "$CONTAINER" ]]; then
  echo "KOV app is not installed in the iPhone simulator." >&2
  exit 1
fi

test -s "$SCREENSHOT_DIR/01-kov-iphone-home.png"
echo "KOV iOS app installed and launched in iPhone simulator; screenshot captured."
