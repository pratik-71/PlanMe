package com.planme.alarms;

import android.app.Activity;
import android.app.NotificationManager;
import android.content.Context;
import android.media.MediaPlayer;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Vibrator;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

public class AlarmActivity extends Activity {
    private MediaPlayer mediaPlayer;
    private Vibrator vibrator;
    private boolean isAlarmActive = true;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Make it full screen and wake up the device
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN |
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON,
            WindowManager.LayoutParams.FLAG_FULLSCREEN |
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON
        );
        
        setContentView(R.layout.activity_alarm);
        
        // Get alarm details from intent
        String title = getIntent().getStringExtra("title");
        String body = getIntent().getStringExtra("body");
        int notificationId = getIntent().getIntExtra("notificationId", -1);
        
        // Setup UI
        TextView titleView = findViewById(R.id.alarm_title);
        TextView bodyView = findViewById(R.id.alarm_body);
        TextView timeView = findViewById(R.id.current_time);
        Button snoozeButton = findViewById(R.id.snooze_button);
        Button dismissButton = findViewById(R.id.dismiss_button);
        
        titleView.setText(title != null ? title : "ALARM");
        bodyView.setText(body != null ? body : "Time to wake up!");
        
        // Update current time
        updateCurrentTime(timeView);
        
        // Start alarm sound and vibration
        startAlarm();
        
        // Setup buttons
        snoozeButton.setOnClickListener(v -> {
            snoozeAlarm(notificationId);
        });
        
        dismissButton.setOnClickListener(v -> {
            dismissAlarm(notificationId);
        });
    }
    
    private void updateCurrentTime(TextView timeView) {
        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("h:mm a", java.util.Locale.getDefault());
        String currentTime = sdf.format(new java.util.Date());
        timeView.setText(currentTime);
    }
    
    private void startAlarm() {
        try {
            // Play alarm sound
            Uri alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            if (alarmUri == null) {
                alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
            }
            
            mediaPlayer = MediaPlayer.create(this, alarmUri);
            mediaPlayer.setLooping(true);
            mediaPlayer.start();
            
            // Start vibration
            vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (vibrator != null && vibrator.hasVibrator()) {
                long[] pattern = {0, 1000, 1000, 1000, 1000, 1000};
                vibrator.vibrate(pattern, 0); // Repeat indefinitely
            }
            
        } catch (Exception e) {
            Toast.makeText(this, "Error starting alarm: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }
    
    private void stopAlarm() {
        if (mediaPlayer != null) {
            mediaPlayer.stop();
            mediaPlayer.release();
            mediaPlayer = null;
        }
        
        if (vibrator != null) {
            vibrator.cancel();
        }
        
        isAlarmActive = false;
    }
    
    private void snoozeAlarm(int notificationId) {
        stopAlarm();
        
        // Cancel the current notification
        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (notificationManager != null) {
            notificationManager.cancel(notificationId);
        }
        
        // Schedule snooze alarm for 5 minutes later
        // This will be handled by the Capacitor LocalNotifications plugin
        // The snooze functionality is implemented in the alarmService
        Toast.makeText(this, "Alarm snoozed for 5 minutes", Toast.LENGTH_SHORT).show();
        
        finish();
    }
    
    private void dismissAlarm(int notificationId) {
        stopAlarm();
        
        // Cancel the current notification
        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (notificationManager != null) {
            notificationManager.cancel(notificationId);
        }
        
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
