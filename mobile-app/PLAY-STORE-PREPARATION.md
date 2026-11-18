# Google Play preparation — KOV Career Agency

This document is for the Android app only. It does not create website pages or change the live website.

## App identity

- Store title: KOV Career Agency
- Android application ID: `com.kovcareeragency.app`
- Website loaded by the app: https://www.kovcareeragency.org
- Privacy notice: https://www.kovcareeragency.org/privacy.html
- Support contact: daniel@kovcareeragency.org
- Suggested category: Business
- Suggested target audience: adults / professionals (18+)
- Ads: no advertising SDK or ad placement is included in the mobile wrapper. Recheck the website and all loaded third-party content before declaring "No" in Play Console.

## Store listing draft

### Short description

Explore KOV career representation and professional services on mobile.

### Full description

KOV Career Agency provides career representation and professional services for experienced professionals, alongside talent-sourcing services for organisations.

Use the app to browse KOV's existing website, explore services and resources, learn how engagements work, and contact the agency.

For professionals, KOV's website explains private career representation, career positioning, target-role and company research, professional outreach, and individual career services.

For organisations, KOV's website explains global talent sourcing and executive talent research.

The app opens the official KOV Career Agency website from a small local bootstrap. Website content remains the source of truth, so changes published on the website appear when users open or refresh the app without duplicating content or creating a separate platform.

Internet access is required. Information submitted through website forms or account areas is handled under KOV's Privacy Notice.

Privacy: https://www.kovcareeragency.org/privacy.html
Support: daniel@kovcareeragency.org

## Data Safety — evidence-based draft, not yet a final declaration

Google Play treats data submitted through a WebView controlled by the app as app data collection. The app therefore cannot be declared "no data collected" just because the forms are hosted on the website.

The existing KOV Privacy Notice describes the following information, depending on how a person uses the website:

- Personal information: name, email address, phone number, account and company details.
- Career / professional information: career and hiring preferences, skills, experience, region, target role, salary range, LinkedIn URL, company, market, seniority and timeline.
- Messages and user-provided text: contact inquiries and other messages.
- Files and documents: CV files uploaded to private storage.
- Security information: a keyed, non-reversible hash derived from the request IP address for short-term submission limiting; the notice says the raw IP is not stored in the lead record.
- Candidate profile data shared with employer-directory users: KOV's notice says employers receive a masked profile containing the KOV candidate code, initials, skills, experience and region, not the candidate's legal name, personal email, phone number or CV link. This is third-party sharing that should be reflected accurately in the form when applicable.
- Providers: hosting and database providers process account, profile, contact and file data; a payment provider processes payment details if online billing is used.

Before completing Data Safety, verify the currently deployed site's actual integrations and behavior, including whether accounts, CV uploads, billing or any additional provider integrations are active in production. Disclose all data types collected by the website and any SDKs or external services loaded inside the WebView. Confirm which fields are actually shared to employer directory users. Do not make a "no data collected" declaration.

Encryption: the app loads the KOV site over HTTPS. Verify all embedded endpoints and file upload/download flows use HTTPS before declaring all collected data encrypted in transit.

Data deletion: the existing Privacy Notice has a dedicated “Request access or deletion” section and allows users to request deletion by emailing daniel@kovcareeragency.org. Google’s current policy accepts a customer-service email or form as a deletion-request path, but KOV must actually process those requests and delete the associated account data (including data held by processors where required). The Privacy Notice is already linked from the site's footer, so it is reachable inside the website wrapper and externally. Confirm that the email route is monitored and the deletion procedure is operational before entering https://www.kovcareeragency.org/privacy.html as the Play Console account-deletion URL.

## Technical release requirements

- Capacitor 8 is selected because its Android target SDK is API 36, which meets Google's new-app target requirement effective August 31, 2026.
- The CI workflow builds a debug APK for device testing and a release Android App Bundle (AAB).
- The generated release AAB is unsigned unless a signing key is configured. A signed AAB is required for Play Console upload.
- The app uses a local bootstrap to navigate to the live website; this is still a remote website wrapper and is not a guarantee of store acceptance.
- Create or use an RSA upload keystore, keep the JKS file and password private, and enrol the app in Play App Signing. Never commit signing files or passwords to this repository.
- Confirm the application ID is available and use it consistently; Play package IDs cannot be changed after publishing.
- Set a monotonically increasing version code for every subsequent Play upload.

## Store listing assets still required

- 512 × 512 PNG app icon for the Play listing.
- 1024 × 500 feature graphic.
- At least two genuine screenshots of the running app on supported Android devices; do not use mock screens that are not in the app.
- App contact details and developer identity verified in Play Console.

Use KOV's existing approved logo/brand artwork for the icon and graphic. The CI run generates emulator screenshots; inspect them for accurate, representative content before submitting.

## Play Console declarations

Complete these in the account owner’s Play Console:

- App access: the public website can be opened without reviewer credentials; identify any restricted account-only area and supply valid review access instructions if needed.
- Ads declaration: verify against the complete live website and its third-party embeds.
- Target audience and content: select the real audience; this is a professional services website and is not designed for children.
- Content rating: complete the questionnaire truthfully.
- Data Safety: complete from a current production data-flow audit, not assumptions.
- Privacy policy: link the KOV Privacy Notice.
- Account deletion: provide a readily discoverable in-app path and an external request route if the app permits account creation.
- App category, contact details, store listing, screenshots and feature graphic.
- Country availability, pricing (free app if no charge for installing), and release notes.

## Testing and policy risk

- Test the app on real Android devices: cold launch, internal page navigation, website updates, external links, email links, back navigation, keyboard, cookies/session persistence, forms, CV upload, downloads, offline/error state and screen rotation.
- Google Play requires apps to offer adequate functionality and content. It specifically scrutinises webviews and limited-functionality apps. KOV owns and controls the website, so the website-owner permission issue does not apply; however, Google can still reject a simple website wrapper if it considers the app to lack adequate app-specific utility. This risk cannot be eliminated while keeping the product strictly as a website wrapper with no extra functionality.
- A successful CI build, passing technical checks, or completing store metadata does not guarantee Play approval.
- If this is a newly created personal Play developer account opened after 13 November 2023, Google requires a closed test with at least 12 testers opted in continuously for 14 days before applying for production access. This does not apply to every account type.

## Not included / account-owner actions

I cannot complete or truthfully attest to the Play Console account's developer identity, legal declarations, live-site data processing, deletion execution, test recruitment, or final release submission without access to the account owner and confirmed operational facts. No account credentials or signing secrets should be pasted into chat.
