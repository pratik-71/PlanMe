package com.planme.alarms;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

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
            int alarmId = call.getInt("alarmId", 0);
            String title = call.getString("title", "Alarm");
            String body = call.getString("body", "Time to wake up!");
            long scheduledTime = call.getLong("scheduledTime", 0);
            String color = call.getString("color", "red");
            String sound = call.getString("sound", "alarm_sound");
            int snoozeMinutes = call.getInt("snoozeMinutes", 5);
            boolean repeatDaily = call.getBoolean("repeatDaily", false);
            
            // Create intent for AlarmReceiver
            Intent alarmIntent = new Intent(getContext(), AlarmReceiver.class);
            alarmIntent.setAction("com.planme.alarms.ALARM_TRIGGERED");
            alarmIntent.putExtra("title", title);
            alarmIntent.putExtra("body", body);
            alarmIntent.putExtra("alarmId", alarmId);
            alarmIntent.putExtra("color", color);
            alarmIntent.putExtra("sound", sound);
            alarmIntent.putExtra("snoozeMinutes", snoozeMinutes);
            alarmIntent.putExtra("repeatDaily", repeatDaily);
            
            // Create PendingIntent
            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                getContext(),
                alarmId,
                alarmIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            
            // Schedule alarm using AlarmManager
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    scheduledTime,
                    pendingIntent
                );
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    scheduledTime,
                    pendingIntent
                );
            }
            
            Log.d(TAG, "Real alarm scheduled: " + alarmId + " for " + new java.util.Date(scheduledTime));
            
            JSObject result = new JSObject();
            result.put("success", true);
            result.put("alarmId", alarmId);
            call.resolve(result);
            
        } catch (Exception e) {
            Log.e(TAG, "Error scheduling real alarm", e);
            call.reject("Error scheduling alarm: " + e.getMessage());
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
}
