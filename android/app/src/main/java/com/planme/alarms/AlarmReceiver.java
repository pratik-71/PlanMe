package com.planme.alarms;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.MediaPlayer;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Vibrator;

public class AlarmReceiver extends BroadcastReceiver {
    private static MediaPlayer mediaPlayer;
    private static Vibrator vibrator;
    
    @Override
    public void onReceive(Context context, Intent intent) {
        String title = intent.getStringExtra("title");
        String body = intent.getStringExtra("body");
        int alarmId = intent.getIntExtra("alarmId", 0);
        
        // Launch full-screen alarm activity
        Intent alarmIntent = new Intent(context, AlarmActivity.class);
        alarmIntent.putExtra("title", title);
        alarmIntent.putExtra("body", body);
        alarmIntent.putExtra("alarmId", alarmId);
        alarmIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | 
                           Intent.FLAG_ACTIVITY_CLEAR_TOP |
                           Intent.FLAG_ACTIVITY_SINGLE_TOP);
        
        // Start alarm activity
        context.startActivity(alarmIntent);
        
        // Start alarm sound and vibration immediately
        startAlarmSound(context);
        startVibration(context);
    }
    
    private void startAlarmSound(Context context) {
        try {
            if (mediaPlayer != null) {
                mediaPlayer.stop();
                mediaPlayer.release();
            }
            
            Uri alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            if (alarmUri == null) {
                alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
            }
            
            mediaPlayer = MediaPlayer.create(context, alarmUri);
            mediaPlayer.setLooping(true);
            mediaPlayer.start();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    private void startVibration(Context context) {
        try {
            vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
            if (vibrator != null && vibrator.hasVibrator()) {
                long[] pattern = {0, 1000, 1000, 1000, 1000, 1000};
                vibrator.vibrate(pattern, 0); // Repeat indefinitely
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    public static void stopAlarm() {
        if (mediaPlayer != null) {
            mediaPlayer.stop();
            mediaPlayer.release();
            mediaPlayer = null;
        }
        
        if (vibrator != null) {
            vibrator.cancel();
        }
    }
}
