package com.planme.alarms;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.PowerManager;
import android.os.Vibrator;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

public class AlarmActivity extends Activity {
    private MediaPlayer mediaPlayer;
    private Vibrator vibrator;
    private PowerManager.WakeLock wakeLock;
    private boolean isAlarmActive = true;
    private int alarmId;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Get alarm details from intent
        String title = getIntent().getStringExtra("title");
        String body = getIntent().getStringExtra("body");
        alarmId = getIntent().getIntExtra("alarmId", -1);
        
        // Setup full screen alarm like Google Clock
        setupFullScreenAlarm();
        
        setContentView(R.layout.activity_alarm);
        
        // Setup UI
        TextView titleView = findViewById(R.id.alarm_title);
        TextView bodyView = findViewById(R.id.alarm_body);
        TextView timeView = findViewById(R.id.current_time);
        Button snoozeButton = findViewById(R.id.snooze_button);
        Button dismissButton = findViewById(R.id.dismiss_button);
        
        titleView.setText(title != null ? title : "🚨 ALARM");
        bodyView.setText(body != null ? body : "Time to wake up!");
        
        // Update current time
        updateCurrentTime(timeView);
        
        // Start alarm sound and vibration
        startAlarm();
        
        // Setup buttons
        snoozeButton.setOnClickListener(v -> {
            snoozeAlarm();
        });
        
        dismissButton.setOnClickListener(v -> {
            dismissAlarm();
        });
    }
    
    private void setupFullScreenAlarm() {
        // Make it full screen and wake up the device like Google Clock
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        
        // Turn on screen and dismiss keyguard
        getWindow().addFlags(
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_FULLSCREEN |
            WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON
        );
        
        // Acquire wake lock to keep screen on
        PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
        wakeLock = powerManager.newWakeLock(
            PowerManager.FULL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP,
            "PlanMe:AlarmWakeLock"
        );
        wakeLock.acquire(10*60*1000L /*10 minutes*/);
        
        // Dismiss keyguard if locked
        KeyguardManager keyguardManager = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
        if (keyguardManager.isKeyguardLocked()) {
            keyguardManager.requestDismissKeyguard(this, null);
        }
    }
    
    private void updateCurrentTime(TextView timeView) {
        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("h:mm a", java.util.Locale.getDefault());
        String currentTime = sdf.format(new java.util.Date());
        timeView.setText(currentTime);
    }
    
    private void startAlarm() {
        try {
            // Set volume to maximum like Google Clock
            AudioManager audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
            audioManager.setStreamVolume(AudioManager.STREAM_ALARM, audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM), 0);
            
            // Play alarm sound continuously
            Uri alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            if (alarmUri == null) {
                alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
            }
            
            mediaPlayer = MediaPlayer.create(this, alarmUri);
            mediaPlayer.setLooping(true);
            mediaPlayer.setAudioStreamType(AudioManager.STREAM_ALARM);
            mediaPlayer.start();
            
            // Start vibration pattern like Google Clock
            vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (vibrator != null && vibrator.hasVibrator()) {
                long[] pattern = {0, 1000, 1000, 1000, 1000, 1000};
                vibrator.vibrate(pattern, 0); // Repeat indefinitely
            }
            
            Toast.makeText(this, "🚨 ALARM TRIGGERED! 🚨", Toast.LENGTH_LONG).show();
            
        } catch (Exception e) {
            Toast.makeText(this, "Error starting alarm: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }
    
    private void stopAlarm() {
        // Stop alarm sound
        if (mediaPlayer != null) {
            mediaPlayer.stop();
            mediaPlayer.release();
            mediaPlayer = null;
        }
        
        // Stop vibration
        if (vibrator != null) {
            vibrator.cancel();
        }
        
        // Release wake lock
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
        
        isAlarmActive = false;
    }
    
    private void snoozeAlarm() {
        stopAlarm();
        
        // Schedule snooze alarm for 5 minutes later using AlarmManager
        try {
            android.app.AlarmManager alarmManager = (android.app.AlarmManager) getSystemService(Context.ALARM_SERVICE);
            android.content.Intent snoozeIntent = new android.content.Intent(this, AlarmReceiver.class);
            snoozeIntent.setAction("com.planme.alarms.ALARM_TRIGGERED");
            snoozeIntent.putExtra("title", getIntent().getStringExtra("title"));
            snoozeIntent.putExtra("body", "Snoozed: " + getIntent().getStringExtra("body"));
            snoozeIntent.putExtra("alarmId", alarmId);
            
            android.app.PendingIntent snoozePendingIntent = android.app.PendingIntent.getBroadcast(
                this, alarmId + 1000, snoozeIntent, android.app.PendingIntent.FLAG_UPDATE_CURRENT | android.app.PendingIntent.FLAG_IMMUTABLE
            );
            
            long snoozeTime = System.currentTimeMillis() + (5 * 60 * 1000); // 5 minutes
            alarmManager.setExactAndAllowWhileIdle(android.app.AlarmManager.RTC_WAKEUP, snoozeTime, snoozePendingIntent);
            
            Toast.makeText(this, "Alarm snoozed for 5 minutes", Toast.LENGTH_SHORT).show();
            
        } catch (Exception e) {
            Toast.makeText(this, "Error snoozing alarm: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
        
        finish();
    }
    
    private void dismissAlarm() {
        stopAlarm();
        Toast.makeText(this, "Alarm dismissed", Toast.LENGTH_SHORT).show();
        finish();
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        stopAlarm();
    }
    
    @Override
    public void onBackPressed() {
        // Prevent back button from dismissing alarm
        // User must use snooze or dismiss buttons
    }
}
