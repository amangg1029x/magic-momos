package com.magicmomos.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.ionicframework.capacitor.Checkout;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // ── Razorpay native Checkout plugin ──────────────────────────────────
        // Replaces the previous WebChromeClient.onCreateWindow() patch, which
        // tried to forward bank/UPI redirect URLs from a detached, invisible
        // WebView back into the main one. That approach is exactly what
        // Razorpay's own docs warn against — checkout.js inside a WebView
        // doesn't reliably support netbanking/UPI/wallet redirects, because
        // those flows depend on window.open()/full navigation behaviour that
        // WebViews don't replicate the way a real browser does.
        //
        // registerPlugin(Checkout.class) wires up Razorpay's real native
        // Android SDK instead, so netbanking/UPI/cards/wallets all open
        // through proper native Activities rather than nested WebViews.
        registerPlugin(Checkout.class);
    }
}