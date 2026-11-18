import type { CapacitorConfig } from '@capacitor/cli';

/**
 * KOV mobile wrapper.
 *
 * The app intentionally displays the existing KOV website. Website content,
 * pages, forms, and updates remain managed at kovcareeragency.org.
 *
 * NOTE: Capacitor documents server.url as a live-reload mechanism rather than
 * a production distribution pattern. This configuration is a functional
 * prototype and must pass platform-specific review before store submission.
 */
const config: CapacitorConfig = {
  appId: 'com.kovcareeragency.app',
  appName: 'KOV Career Agency',
  webDir: 'www',
  server: {
    url: 'https://www.kovcareeragency.org',
    cleartext: false,
    allowNavigation: [
      'kovcareeragency.org',
      '*.kovcareeragency.org',
    ],
  },
  backgroundColor: '#ffffff',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
