package com.magicmomos.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.ionicframework.capacitor.Checkout;

public class MainActivity extends BridgeActivity {
    /** Channel ID referenced by the FCM payload (backend sends android.channelId = this)
     *  NOTE: If you change the sound/vibration settings, increment the suffix (v2→v3)
     *  because Android permanently caches channel settings and won't update them. */
    public static final String NEW_ORDER_CHANNEL_ID = "new_order_v2";

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

        // ── Create high-priority "New Order" notification channel ─────────────
        // On Android 8+, channels must be created before any notification is shown.
        // We do it here so the channel is always registered before FCM delivers
        // the first push, even when the app is launched from a notification tap.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            createNewOrderChannel();
        }
    }

    private void createNewOrderChannel() {
        NotificationManager nm = getSystemService(NotificationManager.class);
        if (nm == null) return;

        // Skip if the channel already exists (survives app restarts)
        if (nm.getNotificationChannel(NEW_ORDER_CHANNEL_ID) != null) return;

        // Point to our custom ringtone in res/raw/
        Uri soundUri = Uri.parse(
            "android.resource://" + getPackageName() + "/raw/order_ringtone"
        );

        AudioAttributes audioAttributes = new AudioAttributes.Builder()
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .setUsage(AudioAttributes.USAGE_NOTIFICATION)
            .build();

        NotificationChannel channel = new NotificationChannel(
            NEW_ORDER_CHANNEL_ID,
            "New Orders",                          // User-visible name in Settings
            NotificationManager.IMPORTANCE_HIGH    // Heads-up + sound + vibration
        );
        channel.setDescription("Plays a ringtone when a customer places a new order");
        channel.setSound(soundUri, audioAttributes);
        channel.enableVibration(true);
        channel.setVibrationPattern(new long[]{0, 500, 300, 500, 300, 500});
        channel.setShowBadge(true);

        nm.createNotificationChannel(channel);
    }
}