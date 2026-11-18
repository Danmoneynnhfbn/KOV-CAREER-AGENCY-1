import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.kovcareeragency.app',
  appName: 'KOV Career Agency',
  webDir: 'www',
  backgroundColor: '#101820',
  loggingBehavior: 'none',
  server: {
    // The app intentionally serves the live website so every website update
    // appears in the app without copying or maintaining a second set of pages.
    url: 'https://www.kovcareeragency.org',
    cleartext: false,
    // Keep both first-party hostnames inside the app if the canonical host
    // redirects between www and the apex domain.
    allowNavigation: [
      'www.kovcareeragency.org',
      'kovcareeragency.org'
    ],
    errorPath: 'offline.html'
  },
  ios: {
    preferredContentMode: 'mobile',
    contentInset: 'automatic',
    scrollEnabled: true,
    allowsLinkPreview: true
  },
  android: {
    allowMixedContent: false,
    zoomEnabled: true,
    webContentsDebuggingEnabled: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 900,
      launchAutoHide: true,
      backgroundColor: '#101820',
      showSpinner: false
    }
  }
};

export default config;
