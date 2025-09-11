package com.planme.alarms;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.PowerManager;
import android.util.Log;
import androidx.core.app.NotificationCompat;

public class AlarmReceiver extends BroadcastReceiver {
    private static final String TAG = "AlarmReceiver";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "🚨 [RECEIVER] Alarm triggered: " + intent.getAction());
        Log.d(TAG, "🚨 [RECEIVER] Intent extras: " + intent.getExtras());
        
        String title = intent.getStringExtra("title");
        String body = intent.getStringExtra("body");
        int alarmId = intent.getIntExtra("alarmId", 0);
        
        Log.d(TAG, "🚨 [RECEIVER] Extracted data:");
        Log.d(TAG, "🚨 [RECEIVER] - title: " + title);
        Log.d(TAG, "🚨 [RECEIVER] - body: " + body);
        Log.d(TAG, "🚨 [RECEIVER] - alarmId: " + alarmId);
        
        // Wake up device if sleeping
        Log.d(TAG, "🚨 [RECEIVER] Acquiring wake lock to wake up device...");
        PowerManager powerManager = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        PowerManager.WakeLock wakeLock = powerManager.newWakeLock(
            PowerManager.FULL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP,
            "PlanMe:AlarmWakeLock"
        );
        wakeLock.acquire(10000); // 10 seconds
        Log.d(TAG, "🚨 [RECEIVER] Wake lock acquired");
        
        try {
            // Create notification channel for Android 8+
            createNotificationChannel(context);
            
            // Create full-screen intent for alarm
            Log.d(TAG, "🚨 [RECEIVER] Creating full-screen alarm intent...");
            Intent alarmIntent = new Intent(context, AlarmActivity.class);
            alarmIntent.putExtra("title", title);
            alarmIntent.putExtra("body", body);
            alarmIntent.putExtra("alarmId", alarmId);
            alarmIntent.addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK | 
                Intent.FLAG_ACTIVITY_CLEAR_TOP |
                Intent.FLAG_ACTIVITY_SINGLE_TOP |
                Intent.FLAG_ACTIVITY_BROUGHT_TO_FRONT |
                Intent.FLAG_ACTIVITY_NO_ANIMATION |
                Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS |
                Intent.FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY |
                Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED
            );
            
            // Create PendingIntent for full-screen notification
            PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(
                context, 
                alarmId, 
                alarmIntent, 
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            
            // Create high-priority notification that launches full-screen activity
            NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(context, "ALARM_CHANNEL")
                .setSmallIcon(android.R.drawable.ic_dialog_alert)
                .setContentTitle(title != null ? title : "🚨 ALARM")
                .setContentText(body != null ? body : "Time to wake up!")
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setFullScreenIntent(fullScreenPendingIntent, true)
                .setAutoCancel(false)
                .setOngoing(true)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setDefaults(NotificationCompat.DEFAULT_ALL)
                .setSound(android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_ALARM));
            
            // Show notification
            NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            notificationManager.notify(alarmId, notificationBuilder.build());
            
            Log.d(TAG, "✅ [RECEIVER] Full-screen alarm notification created!");
            
            // Also try direct activity launch as backup
            Log.d(TAG, "🚨 [RECEIVER] Also trying direct activity launch...");
            context.startActivity(alarmIntent);
            Log.d(TAG, "✅ [RECEIVER] Direct activity launch attempted!");
            
        } catch (Exception e) {
            Log.e(TAG, "❌ [RECEIVER] Error launching alarm", e);
        } finally {
            // Release wake lock
            Log.d(TAG, "🚨 [RECEIVER] Releasing wake lock...");
            if (wakeLock.isHeld()) {
                wakeLock.release();
                Log.d(TAG, "✅ [RECEIVER] Wake lock released");
            }
        }
    }
    
    private void createNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                "ALARM_CHANNEL",
                "Alarm Notifications",
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("High priority alarm notifications");
            channel.enableLights(true);
            channel.enableVibration(true);
            channel.setShowBadge(true);
            channel.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);
            
            NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            notificationManager.createNotificationChannel(channel);
            Log.d(TAG, "✅ [RECEIVER] Notification channel created");
        }
    }
}
