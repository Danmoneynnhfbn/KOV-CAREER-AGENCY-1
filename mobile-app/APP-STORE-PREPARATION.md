# Apple App Store preparation — KOV Career Agency

This document prepares the iOS app without creating new website pages, a separate platform, or a second login system.

## App identity

- App name: KOV Career Agency
- Bundle identifier: `com.kovcareeragency.app` (keep aligned with Capacitor config)
- Website: https://www.kovcareeragency.org
- Privacy policy: https://www.kovcareeragency.org/privacy.html
- Support: daniel@kovcareeragency.org
- Primary language: English
- Suggested primary category: Business

## Product scope

The iOS app is a native shell that opens the existing official KOV Career Agency website. The website remains the sole source of truth. Do not duplicate website pages or create a second account, database, or platform.

## Store description draft

KOV Career Agency brings the agency's official website to your iPhone.

Explore KOV's existing career representation, professional positioning and executive talent sourcing information. Browse services, learn about the agency's approach, and contact KOV through the website.

The app opens the official KOV Career Agency website, so the information you see stays aligned with the live website.

Privacy: https://www.kovcareeragency.org/privacy.html
Support: daniel@kovcareeragency.org

## Privacy information — draft only

Apple requires App Store Connect privacy details to cover data collected by the app and third-party partners. Since this app loads the KOV website, the privacy assessment must include the website's forms, account areas, file uploads, embedded scripts, analytics and all providers used by the live site.

The KOV privacy notice describes personal contact details, career and professional profile information, user messages, uploaded CV files, security metadata and masked candidate profile sharing in relevant workflows. This is not a final App Privacy declaration. Audit actual production behavior and map each data type to Apple's categories, purposes, linked-to-user status and tracking status before submission.

Privacy policy URL: https://www.kovcareeragency.org/privacy.html

## App Review risk

Apple Guideline 4.2 says an app should provide features, content and UI that elevate it beyond a repackaged website. It also cautions against apps that are primarily marketing materials, web clippings or collections of links.

KOV's requested product is deliberately a straightforward website wrapper. This creates a material App Store rejection risk if Apple decides the app does not provide sufficient app-like utility. Do not misrepresent the app or add invented features to the listing. A build passing does not mean Apple will approve it.

Official reference: https://developer.apple.com/app-store/review/guidelines/

## Build and signing state

- CI currently produces an iOS simulator build only.
- A simulator build is not a signed App Store archive or IPA.
- App Store distribution requires Apple Developer Program membership, App Store Connect access, distribution signing and provisioning.
- Do not commit certificates, private keys, provisioning profiles or credentials to this repository.
- After registration, create the app record using the exact bundle identifier and configure signing securely.

## Screenshots and listing materials

- Capture genuine screenshots from the running iOS app on supported iPhone screen sizes.
- Screenshots must show real app use and accurately represent the submitted binary.
- Do not use Android screenshots as iPhone screenshots or submit mockups as if they were app captures.
- Prepare the app icon from KOV's approved brand asset and inspect it at actual iOS icon sizes.
- Complete subtitle, description, keywords, support URL, privacy policy URL, age rating and review notes in App Store Connect.

## Pre-registration work

- [x] Generate iOS project in CI.
- [x] Generate iOS app icon assets.
- [x] Sync the website wrapper.
- [x] Build the iOS simulator app in CI.
- [ ] Verify the latest workflow run completes successfully.
- [ ] Inspect the actual iOS simulator app and website navigation.
- [ ] Test internal navigation, back behavior, forms, sessions, CV uploads, downloads, email/phone links and external links.
- [ ] Test on a physical iPhone.
- [ ] Capture genuine iPhone screenshots.
- [ ] Reconcile website data practices with the privacy notice and App Privacy labels.
- [ ] Confirm accessibility, safe areas, keyboard behavior, orientation and offline/error recovery.

## Account-owner steps after registration

- Apple Developer Program enrollment and identity verification.
- App Store Connect app record.
- Distribution certificate and provisioning profile.
- App Privacy declarations and age rating.
- Final metadata and screenshots.
- TestFlight distribution and review.
- App Review submission and response to reviewer questions.
