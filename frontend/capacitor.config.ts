import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.magicmomos.app',
  appName: 'Magic Momos',
  webDir: 'dist',

  // ── Android ────────────────────────────────────────────────────────────────
  android: {
    // Was `true`. That was needed to let the WebView load bank redirect
    // pages over plain http during the old checkout.js-in-WebView hack.
    // Not needed now that Razorpay payment flows run in their own native
    // SDK Activity, completely outside your WebView. Keeping this false
    // is the safer default — flip back to true only if something else in
    // your app specifically needs mixed http+https content.
    allowMixedContent: false,
  },

  server: {
    // Was 'http'. Reverted to the default 'https' — your own app's pages
    // (login, JWT cookies, etc.) should be treated as a secure origin.
    // This was likely set to work around the old WebView payment hack and
    // isn't needed for that purpose anymore.
    androidScheme: 'https',

    // IMPORTANT — you previously had this set in TWO different places with
    // CONFLICTING values:
    //   capacitor.config.ts:   allowNavigation: ['*']                 (wide open)
    //   capacitor.config.json: allowNavigation: ['checkout.razorpay.com']  (correct, but unused)
    // Capacitor only reads ONE config file — .ts takes priority over .json
    // when both exist — so the wildcard '*' was the one actually in effect,
    // silently widening what external domains your WebView is allowed to
    // navigate to. Consolidated here to the narrow, correct value.
    //
    // With the native Razorpay plugin, your WebView itself no longer needs
    // to navigate to checkout.razorpay.com at all (that flow now happens in
    // Razorpay's native SDK), but this is left in case you use Razorpay's
    // web Checkout anywhere else (e.g. a desktop/PWA build of the same code).
    allowNavigation: ['checkout.razorpay.com'],
  },

  plugins: {
    CapacitorHttp: {
      enabled: false,
    },
    CapacitorUpdater: {
      autoUpdate: true,
    },
  },


  // REMOVED: overrideUserAgent spoofing a desktop-flavoured mobile Chrome UA.
  // This was almost certainly added because some bank/UPI pages serve broken
  // markup to WebView's real UA. That problem belonged to the old
  // checkout.js-in-WebView approach — Razorpay's native SDK doesn't run
  // inside your WebView, so it isn't affected by your UA string at all.
  // If anything ELSE in your app depends on this spoofed UA, re-add it
  // and test specifically what broke before assuming it's safe to leave off.
};

export default config;