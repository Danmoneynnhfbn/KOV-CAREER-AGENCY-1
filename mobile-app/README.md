# KOV Career Agency mobile app

This is a mobile shell for the existing KOV Career Agency website. It does not
create a second website, new pages, a new login system, or a separate database.
The app loads https://www.kovcareeragency.org, so published website updates
remain the source of truth.

## Platforms

- Android: Capacitor Android project
- iOS: Capacitor iOS project

## Local setup

Requirements:
- Node.js 20+
- Android Studio + Android SDK for Android builds
- macOS + Xcode for iOS builds

From this directory:

```sh
npm install
npx cap add android
npx cap add ios
npx cap sync
```

Open the native projects:

```sh
npx cap open android
npx cap open ios
```

## Important distribution limitation

This initial implementation uses Capacitor's remote `server.url` setting to
load the existing live website. Capacitor documents this setting primarily for
live reload and does not recommend it as a production distribution approach.
A website-only wrapper may also fail Apple's minimum-functionality review or
Google Play review. A successful local build does not guarantee store approval.

Before a public store release:
1. Confirm platform review requirements and choose an implementation that
   satisfies them without changing the KOV website experience.
2. Configure production signing, package identifiers, privacy disclosures,
   support URL, and store listing assets.
3. Test navigation, forms, downloads, cookies, external links, file uploads,
   keyboard behavior, and back navigation on real devices.
4. Configure verified Android App Links / iOS Universal Links if desired.

No production website files or existing backend services are changed by this
mobile-app directory.
