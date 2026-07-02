package com.magicmomos.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * StopAlarmReceiver
 *
 * Receives the "STOP ALARM" broadcast from the notification action button
 * and delegates to OrderAlarmService to stop the loop and dismiss the notification.
 */
public class StopAlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        Intent stopIntent = new Intent(context, OrderAlarmService.class);
        stopIntent.setAction(OrderAlarmService.ACTION_STOP);
        context.startService(stopIntent);
    }
}
