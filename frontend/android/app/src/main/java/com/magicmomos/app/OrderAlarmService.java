package com.magicmomos.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;

/**
 * OrderAlarmService
 *
 * A ForegroundService that plays order_ringtone.wav on a continuous loop
 * and shows a heads-up notification with a "STOP ALARM" action button.
 *
 * Started by MagicMomosMessagingService when a data-only FCM "alarm=true"
 * message arrives. Stopped by StopAlarmReceiver when the user taps STOP,
 * or automatically when the admin opens the app and taps the in-app banner.
 */
public class OrderAlarmService extends Service {

    public static final String ACTION_STOP = "com.magicmomos.app.ACTION_STOP_ALARM";
    private static final int NOTIF_ID = 9001;
    private static final String ALARM_CHANNEL = "order_alarm_channel";

    private MediaPlayer mediaPlayer;

    @Override
    public void onCreate() {
        super.onCreate();
        createAlarmChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (ACTION_STOP.equals(intent != null ? intent.getAction() : null)) {
            stopAlarm();
            return START_NOT_STICKY;
        }

        String title = intent != null ? intent.getStringExtra("title") : "New Order!";
        String body  = intent != null ? intent.getStringExtra("body")  : "A customer placed a new order.";
        if (title == null) title = "New Order! 🥟";
        if (body  == null) body  = "A customer placed a new order.";

        // Build a STOP intent
        Intent stopIntent = new Intent(this, StopAlarmReceiver.class);
        stopIntent.setAction(ACTION_STOP);
        PendingIntent stopPi = PendingIntent.getBroadcast(
            this, 0, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // Build a tap-to-open intent (opens the app)
        Intent openIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
        PendingIntent openPi = PendingIntent.getActivity(
            this, 1, openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Notification notification = new NotificationCompat.Builder(this, ALARM_CHANNEL)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle(title)
            .setContentText(body)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(true)          // Cannot be swiped away
            .setAutoCancel(false)
            .setContentIntent(openPi)
            .addAction(android.R.drawable.ic_delete, "STOP ALARM", stopPi)
            .build();

        startForeground(NOTIF_ID, notification);
        startRinging();

        return START_STICKY; // Restart if killed
    }

    private void startRinging() {
        if (mediaPlayer != null) return;
        try {
            Uri soundUri = Uri.parse("android.resource://" + getPackageName() + "/raw/order_ringtone");
            mediaPlayer = new MediaPlayer();
            mediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                .build()
            );
            mediaPlayer.setDataSource(getApplicationContext(), soundUri);
            mediaPlayer.setLooping(true);   // ← Continuous loop until manually stopped
            mediaPlayer.prepare();
            mediaPlayer.start();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void stopAlarm() {
        if (mediaPlayer != null) {
            if (mediaPlayer.isPlaying()) mediaPlayer.stop();
            mediaPlayer.release();
            mediaPlayer = null;
        }
        stopForeground(true);
        stopSelf();
    }

    @Override
    public void onDestroy() {
        stopAlarm();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }

    private void createAlarmChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager nm = getSystemService(NotificationManager.class);
        if (nm == null || nm.getNotificationChannel(ALARM_CHANNEL) != null) return;

        NotificationChannel ch = new NotificationChannel(
            ALARM_CHANNEL,
            "Order Alarm",
            NotificationManager.IMPORTANCE_HIGH
        );
        ch.setDescription("Persistent alarm that rings until manually stopped");
        ch.setSound(null, null); // Sound handled by MediaPlayer, not the channel
        ch.enableVibration(true);
        ch.setVibrationPattern(new long[]{0, 500, 300, 500});
        nm.createNotificationChannel(ch);
    }
}
