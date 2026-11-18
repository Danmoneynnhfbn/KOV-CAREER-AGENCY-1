# KOV Career Agency mobile release readiness

## Product boundary

- The existing KOV Career Agency website is the sole source of truth.
- Android and iPhone are native app shells that open the official website.
- Do not add new website pages, a second login, a separate candidate platform, duplicate content, or a new database.
- Do not change the live website or merge this work into `master` as part of release preparation.

## Implemented in the mobile branch

- Capacitor 8 project with app ID `com.kovcareeragency.app`.
- App name: `KOV Career Agency`.
- Local bundled entry page opens `https://www.kovcareeragency.org/`.
- Only the KOV apex and www domains are allow-listed for in-WebView navigation.
- Android debug APK and release AAB build workflow.
- iOS simulator build workflow.
- Android emulator launch smoke test and screenshot capture.
- Store listing artwork generation and draft store listing text.
- Privacy and Data Safety declaration research notes.

## Validation still required before developer-account registration

- [ ] Confirm latest GitHub Actions run passes after the production bootstrap and navigation changes.
- [ ] Inspect generated Android APK screenshots to confirm the KOV website stays inside the app.
- [ ] Test Android back navigation through several internal website pages.
- [ ] Test website forms, account/session behavior, CV upload, file download, email and phone links.
- [ ] Test external links open appropriately without losing the app session.
- [ ] Test offline launch and recovery after connectivity returns.
- [ ] Test on at least one physical Android phone.
- [ ] Build and test on a physical iPhone using Xcode/TestFlight tooling when Apple signing is available.
- [ ] Verify the app icon, splash screen, status bar, safe areas, keyboard and orientation.
- [ ] Confirm every production website endpoint and embedded third-party service uses HTTPS.
- [ ] Recheck privacy notice, data collection, sharing, retention and account-deletion process against actual production behavior.
- [ ] Review store listing artwork and screenshots for accuracy.

## Requires developer account / account-owner action later

- Google Play Console developer registration and identity verification.
- Apple Developer Program membership and App Store Connect access.
- Android upload keystore and private signing credentials.
- Apple distribution certificate, provisioning profile and signing credentials.
- Final store declarations, data safety form, content rating, app privacy details and legal attestations.
- Store submission, review responses and publication approval.
- Any account-specific testing requirement imposed by the relevant store.

## Release constraints

- The current CI AAB is unsigned and cannot be uploaded as a release until signed.
- The current iOS output is a simulator build, not an App Store IPA.
- A successful build is not store approval. Both stores may assess whether a website-only wrapper offers sufficient functionality and user experience.
- Do not claim an app has been submitted or published until the store confirms that status.
