import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.magicmomos.app',
  appName: 'Magic Momos',
  webDir: 'dist',
  android: {
    allowMixedContent: false
  },
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'checkout.razorpay.com'
    ]
  },
  plugins: {
    CapacitorHttp: {
      enabled: false
    },
    SplashScreen: {
      launchAutoHide: false
    }
  }
};

export default config;
