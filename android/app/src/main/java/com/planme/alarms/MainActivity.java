package com.planme.alarms;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Create notification channel for alarms
        createNotificationChannel();
    }
    
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        
        // Handle alarm intent
        if (intent != null && intent.getAction() != null) {
            if (intent.getAction().equals("android.intent.action.VIEW")) {
                // Launch alarm activity
                Intent alarmIntent = new Intent(this, AlarmActivity.class);
                alarmIntent.putExtra("title", intent.getStringExtra("title"));
                alarmIntent.putExtra("body", intent.getStringExtra("body"));
                alarmIntent.putExtra("notificationId", intent.getIntExtra("notificationId", -1));
                alarmIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                startActivity(alarmIntent);
            }
        }
    }
    
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel alarmChannel = new NotificationChannel(
                "alarm_channel",
                "Alarm Notifications",
                NotificationManager.IMPORTANCE_HIGH
            );
            
            alarmChannel.setDescription("High priority alarm notifications");
            alarmChannel.enableLights(true);
            alarmChannel.setLightColor(android.graphics.Color.RED);
            alarmChannel.enableVibration(true);
            alarmChannel.setVibrationPattern(new long[]{0, 1000, 1000, 1000, 1000, 1000});
            alarmChannel.setShowBadge(true);
            alarmChannel.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);
            alarmChannel.setBypassDnd(true); // Bypass Do Not Disturb
            alarmChannel.setSound(android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_ALARM), null);
            
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(alarmChannel);
            }
        }
    }
}
