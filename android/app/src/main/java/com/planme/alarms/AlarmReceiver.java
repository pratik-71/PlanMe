package com.planme.alarms;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.PowerManager;
import android.util.Log;

public class AlarmReceiver extends BroadcastReceiver {
    private static final String TAG = "AlarmReceiver";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "Alarm triggered: " + intent.getAction());
        
        String title = intent.getStringExtra("title");
        String body = intent.getStringExtra("body");
        int alarmId = intent.getIntExtra("alarmId", 0);
        
        // Wake up device if sleeping
        PowerManager powerManager = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        PowerManager.WakeLock wakeLock = powerManager.newWakeLock(
            PowerManager.FULL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP,
            "PlanMe:AlarmWakeLock"
        );
        wakeLock.acquire(10000); // 10 seconds
        
        try {
            // Launch full-screen alarm activity like Google Clock
            Intent alarmIntent = new Intent(context, AlarmActivity.class);
            alarmIntent.putExtra("title", title);
            alarmIntent.putExtra("body", body);
            alarmIntent.putExtra("alarmId", alarmId);
            alarmIntent.addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK | 
                Intent.FLAG_ACTIVITY_CLEAR_TOP |
                Intent.FLAG_ACTIVITY_SINGLE_TOP |
                Intent.FLAG_ACTIVITY_BROUGHT_TO_FRONT
            );
            
            // Start alarm activity
            context.startActivity(alarmIntent);
            Log.d(TAG, "Alarm activity launched");
            
        } finally {
            // Release wake lock
            if (wakeLock.isHeld()) {
                wakeLock.release();
            }
        }
    }
}
