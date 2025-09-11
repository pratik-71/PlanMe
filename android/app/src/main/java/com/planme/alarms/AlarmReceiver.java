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
            // Launch full-screen alarm activity like Google Clock
            Log.d(TAG, "🚨 [RECEIVER] Creating AlarmActivity intent...");
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
                Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS
            );
            Log.d(TAG, "🚨 [RECEIVER] AlarmActivity intent created with flags");
            
            // Start alarm activity
            Log.d(TAG, "🚨 [RECEIVER] Starting AlarmActivity...");
            context.startActivity(alarmIntent);
            Log.d(TAG, "✅ [RECEIVER] AlarmActivity launched successfully!");
            
        } catch (Exception e) {
            Log.e(TAG, "❌ [RECEIVER] Error launching AlarmActivity", e);
        } finally {
            // Release wake lock
            Log.d(TAG, "🚨 [RECEIVER] Releasing wake lock...");
            if (wakeLock.isHeld()) {
                wakeLock.release();
                Log.d(TAG, "✅ [RECEIVER] Wake lock released");
            }
        }
    }
}
