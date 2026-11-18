# KOV Career Agency mobile app

This project packages the existing KOV Career Agency website for mobile. It does
not create a second website, new content pages, a new login system, or a
separate database. The live website remains the source of truth:

- Website: https://www.kovcareeragency.org
- Privacy notice: https://www.kovcareeragency.org/privacy.html
- Support: daniel@kovcareeragency.org

The app packages a small local bootstrap that opens the official live website. The website remains the single source of truth, so published website content updates are reflected when users open or refresh the app, without duplicating website pages in the app package.

## Platforms

- Android: Capacitor 8; designed for Android 16 / API 36 and Google Play App Bundle output.
- iOS: Capacitor iOS project and simulator build check.

## Local setup

Requirements:
- Node.js 22+
- Android Studio and Android SDK (API 36) for Android builds
- macOS and Xcode for iOS builds

From this directory:

```sh
npm install
npx cap add android
npx cap add ios
npx cap sync
```

Build Android outputs:

```sh
cd android
./gradlew assembleDebug bundleRelease
```

The debug APK is for device testing. The release AAB produced by the current
workflow is unsigned unless a signing key is explicitly configured. Google
Play requires a signed Android App Bundle. Keep the upload keystore and its
password private; do not commit them to GitHub.

## CI builds

The GitHub Actions workflow `.github/workflows/mobile-app-build.yml` runs the
Android debug APK and release AAB build, plus an iOS simulator build. Artifacts
are attached to the workflow run.

## Important Play Store review limitation

The app is intentionally a website presentation layer because that is the requested scope. It now ships a local bootstrap page which navigates to the official live KOV website, rather than setting Capacitor's remote `server.url`. This avoids using the documented live-reload setting as the app's production entry point. It remains a remote website wrapper, so app-store review can still assess its functionality, content, navigation, and user experience.
KOV controls the website, so owner permission is not the blocker; a reviewer
may still decide that a website-only wrapper offers insufficient app-specific
utility. A successful build does not guarantee Play approval.

No production website files, Cloudflare settings, backend services, or
`master` branch changes are made by this mobile-app project.
