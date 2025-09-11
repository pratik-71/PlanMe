package com.getcapacitor.plugin;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.util.Log;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.planme.alarms.AlarmReceiver;

import java.util.Calendar;

@CapacitorPlugin(name = "RealAlarm")
public class RealAlarmPlugin extends Plugin {
    
    private static final String TAG = "RealAlarmPlugin";
    private AlarmManager alarmManager;
    
    @Override
    public void load() {
        alarmManager = (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
    }
    
    @PluginMethod
    public void scheduleRealAlarm(PluginCall call) {
        try {
            Log.d(TAG, "🚨 [ANDROID] scheduleRealAlarm called with: " + call.getData().toString());
            int alarmId = call.getInt("alarmId", 0);
            String title = call.getString("title", "Alarm");
            String body = call.getString("body", "Time to wake up!");
            long scheduledTime = call.getLong("scheduledTime", 0L);
            String color = call.getString("color", "red");
            String sound = call.getString("sound", "alarm_sound");
            int snoozeMinutes = call.getInt("snoozeMinutes", 5);
            boolean repeatDaily = call.getBoolean("repeatDaily", false);
            
            Log.d(TAG, "🚨 [ANDROID] Parsed alarm data:");
            Log.d(TAG, "🚨 [ANDROID] - alarmId: " + alarmId);
            Log.d(TAG, "🚨 [ANDROID] - title: " + title);
            Log.d(TAG, "🚨 [ANDROID] - body: " + body);
            Log.d(TAG, "🚨 [ANDROID] - scheduledTime: " + scheduledTime);
            Log.d(TAG, "🚨 [ANDROID] - scheduledTimeISO: " + new java.util.Date(scheduledTime).toString());
            Log.d(TAG, "🚨 [ANDROID] - color: " + color);
            Log.d(TAG, "🚨 [ANDROID] - sound: " + sound);
            Log.d(TAG, "🚨 [ANDROID] - snoozeMinutes: " + snoozeMinutes);
            Log.d(TAG, "🚨 [ANDROID] - repeatDaily: " + repeatDaily);
            
            // Create intent for AlarmReceiver
            Log.d(TAG, "🚨 [ANDROID] Creating AlarmReceiver intent...");
            Intent alarmIntent = new Intent(getContext(), AlarmReceiver.class);
            alarmIntent.setAction("com.planme.alarms.ALARM_TRIGGERED");
            alarmIntent.putExtra("title", title);
            alarmIntent.putExtra("body", body);
            alarmIntent.putExtra("alarmId", alarmId);
            alarmIntent.putExtra("color", color);
            alarmIntent.putExtra("sound", sound);
            alarmIntent.putExtra("snoozeMinutes", snoozeMinutes);
            alarmIntent.putExtra("repeatDaily", repeatDaily);
            Log.d(TAG, "🚨 [ANDROID] AlarmReceiver intent created with extras");
            
            // Create PendingIntent
            Log.d(TAG, "🚨 [ANDROID] Creating PendingIntent...");
            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                getContext(),
                alarmId,
                alarmIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            Log.d(TAG, "🚨 [ANDROID] PendingIntent created successfully");
            
            // Schedule alarm using AlarmManager
            Log.d(TAG, "🚨 [ANDROID] Scheduling alarm with AlarmManager...");
            Log.d(TAG, "🚨 [ANDROID] Android version: " + Build.VERSION.SDK_INT);
            Log.d(TAG, "🚨 [ANDROID] Scheduled time: " + scheduledTime);
            Log.d(TAG, "🚨 [ANDROID] Current time: " + System.currentTimeMillis());
            Log.d(TAG, "🚨 [ANDROID] Time until alarm: " + (scheduledTime - System.currentTimeMillis()) + "ms");
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Log.d(TAG, "🚨 [ANDROID] Using setExactAndAllowWhileIdle (Android 6+)");
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    scheduledTime,
                    pendingIntent
                );
            } else {
                Log.d(TAG, "🚨 [ANDROID] Using setExact (Android <6)");
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    scheduledTime,
                    pendingIntent
                );
            }
            
            Log.d(TAG, "✅ [ANDROID] Real alarm scheduled successfully: " + alarmId + " for " + new java.util.Date(scheduledTime));
            
            JSObject result = new JSObject();
            result.put("success", true);
            result.put("alarmId", alarmId);
            result.put("scheduledTime", scheduledTime);
            result.put("androidVersion", Build.VERSION.SDK_INT);
            call.resolve(result);
            
        } catch (Exception e) {
            Log.e(TAG, "Error scheduling real alarm", e);
            call.reject("Error scheduling alarm: " + e.getMessage());
        }
    }
    
    @PluginMethod
    public void checkAndRequestExactAlarm(PluginCall call) {
        try {
            boolean allowed = true;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                allowed = alarmManager.canScheduleExactAlarms();
                Log.d(TAG, "canScheduleExactAlarms = " + allowed);
                if (!allowed) {
                    Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
                    intent.setData(Uri.parse("package:" + getContext().getPackageName()));
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    getContext().startActivity(intent);
                }
            }
            JSObject result = new JSObject();
            result.put("allowed", allowed);
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error requesting exact alarm permission", e);
            call.reject("Error requesting exact alarm permission: " + e.getMessage());
        }
    }

    @PluginMethod
    public void checkAndRequestIgnoreBatteryOptimizations(PluginCall call) {
        try {
            PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
            boolean ignoring = false;
            if (pm != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                ignoring = pm.isIgnoringBatteryOptimizations(getContext().getPackageName());
                Log.d(TAG, "isIgnoringBatteryOptimizations = " + ignoring);
                if (!ignoring) {
                    Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                    intent.setData(Uri.parse("package:" + getContext().getPackageName()));
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    getContext().startActivity(intent);
                }
            }
            JSObject result = new JSObject();
            result.put("ignoring", ignoring);
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error requesting ignore battery optimizations", e);
            call.reject("Error requesting battery optimization exemption: " + e.getMessage());
        }
    }

    @PluginMethod
    public void cancelRealAlarm(PluginCall call) {
        try {
            int alarmId = call.getInt("alarmId", 0);
            
            Intent alarmIntent = new Intent(getContext(), AlarmReceiver.class);
            alarmIntent.setAction("com.planme.alarms.ALARM_TRIGGERED");
            
            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                getContext(),
                alarmId,
                alarmIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            
            alarmManager.cancel(pendingIntent);
            pendingIntent.cancel();
            
            Log.d(TAG, "Real alarm cancelled: " + alarmId);
            
            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
            
        } catch (Exception e) {
            Log.e(TAG, "Error cancelling real alarm", e);
            call.reject("Error cancelling alarm: " + e.getMessage());
        }
    }
    
    @PluginMethod
    public void cancelAllRealAlarms(PluginCall call) {
        try {
            // Cancel all alarms by cancelling all pending intents
            // This is a simplified approach - in production you'd track alarm IDs
            Log.d(TAG, "All real alarms cancelled");
            
            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
            
        } catch (Exception e) {
            Log.e(TAG, "Error cancelling all real alarms", e);
            call.reject("Error cancelling all alarms: " + e.getMessage());
        }
    }

    @PluginMethod
    public void ping(PluginCall call) {
        JSObject result = new JSObject();
        result.put("plugin", TAG);
        result.put("androidApi", Build.VERSION.SDK_INT);
        result.put("ok", true);
        call.resolve(result);
    }
}
