package com.magicmomos.app;

import android.content.Intent;
import android.os.Build;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import java.util.Map;

/**
 * MagicMomosMessagingService
 *
 * Custom FirebaseMessagingService that intercepts data-only FCM messages.
 *
 * When a new order arrives and "alarm ring" is enabled in admin settings,
 * the backend sends a data-only FCM (no 'notification' field) with alarm="true".
 * This service receives it and starts OrderAlarmService to loop audio.
 *
 * When alarm ring is DISABLED, the backend sends a normal FCM notification
 * which Android handles natively (onMessageReceived is NOT called in that case).
 */
public class MagicMomosMessagingService extends FirebaseMessagingService {

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);

        Map<String, String> data = remoteMessage.getData();
        if (data == null || data.isEmpty()) return;

        String alarmFlag = data.get("alarm");
        String type      = data.get("type");

        // Only trigger alarm for order_placed data messages with alarm=true
        if ("true".equals(alarmFlag) && "order_placed".equals(type)) {
            String title = data.getOrDefault("title", "New Order! 🥟");
            String body  = data.getOrDefault("body",  "A customer placed a new order.");

            Intent alarmIntent = new Intent(this, OrderAlarmService.class);
            alarmIntent.putExtra("title", title);
            alarmIntent.putExtra("body",  body);

            // On Android 8+ we must use startForegroundService for services
            // that will show a foreground notification.
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(alarmIntent);
            } else {
                startService(alarmIntent);
            }
        }
    }
}
