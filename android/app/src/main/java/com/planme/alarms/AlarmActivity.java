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
        
        android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] AlarmActivity onCreate called");
        
        // Get alarm details from intent
        String title = getIntent().getStringExtra("title");
        String body = getIntent().getStringExtra("body");
        alarmId = getIntent().getIntExtra("alarmId", -1);
        
        android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Intent data:");
        android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] - title: " + title);
        android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] - body: " + body);
        android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] - alarmId: " + alarmId);
        
        // Setup full screen alarm like Google Clock
        android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Setting up full screen alarm...");
        setupFullScreenAlarm();
        
        android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Setting content view...");
        try {
            setContentView(R.layout.activity_alarm);
            android.util.Log.d("AlarmActivity", "✅ [ACTIVITY] Layout loaded successfully");
            
            // Setup UI
            android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Setting up UI elements...");
            TextView titleView = findViewById(R.id.alarm_title);
            TextView bodyView = findViewById(R.id.alarm_body);
            TextView timeView = findViewById(R.id.current_time);
            Button snoozeButton = findViewById(R.id.snooze_button);
            Button dismissButton = findViewById(R.id.dismiss_button);
            
            if (titleView != null) {
                titleView.setText(title != null ? title : "🚨 ALARM");
                android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Title set: " + title);
            } else {
                android.util.Log.e("AlarmActivity", "❌ [ACTIVITY] titleView is null!");
            }
            
            if (bodyView != null) {
                bodyView.setText(body != null ? body : "Time to wake up!");
                android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Body set: " + body);
            } else {
                android.util.Log.e("AlarmActivity", "❌ [ACTIVITY] bodyView is null!");
            }
            
            // Update current time
            if (timeView != null) {
                android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Updating current time...");
                updateCurrentTime(timeView);
            } else {
                android.util.Log.e("AlarmActivity", "❌ [ACTIVITY] timeView is null!");
            }
            
            // Setup buttons
            if (snoozeButton != null && dismissButton != null) {
                android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Setting up buttons...");
                snoozeButton.setOnClickListener(v -> {
                    android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Snooze button clicked");
                    snoozeAlarm();
                });
                
                dismissButton.setOnClickListener(v -> {
                    android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Dismiss button clicked");
                    dismissAlarm();
                });
                android.util.Log.d("AlarmActivity", "✅ [ACTIVITY] Buttons setup completed");
            } else {
                android.util.Log.e("AlarmActivity", "❌ [ACTIVITY] Buttons are null!");
            }
            
        } catch (Exception e) {
            android.util.Log.e("AlarmActivity", "❌ [ACTIVITY] Error setting up UI: " + e.getMessage(), e);
            // Create a simple fallback UI
            createFallbackUI(title, body);
        }
        
        // Start alarm sound and vibration
        android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Starting alarm sound and vibration...");
        startAlarm();
    }
    
    private void createFallbackUI(String title, String body) {
        android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Creating fallback UI...");
        try {
            // Create a simple programmatic UI
            android.widget.LinearLayout layout = new android.widget.LinearLayout(this);
            layout.setOrientation(android.widget.LinearLayout.VERTICAL);
            layout.setBackgroundColor(0xFFFF0000); // Red background
            layout.setGravity(android.view.Gravity.CENTER);
            layout.setPadding(50, 50, 50, 50);
            
            // Title
            TextView titleView = new TextView(this);
            titleView.setText(title != null ? title : "🚨 ALARM");
            titleView.setTextSize(32);
            titleView.setTextColor(0xFFFFFFFF);
            titleView.setGravity(android.view.Gravity.CENTER);
            layout.addView(titleView);
            
            // Body
            TextView bodyView = new TextView(this);
            bodyView.setText(body != null ? body : "Time to wake up!");
            bodyView.setTextSize(18);
            bodyView.setTextColor(0xFFFFFFFF);
            bodyView.setGravity(android.view.Gravity.CENTER);
            layout.addView(bodyView);
            
            // Time
            TextView timeView = new TextView(this);
            timeView.setText(new java.text.SimpleDateFormat("h:mm a", java.util.Locale.getDefault()).format(new java.util.Date()));
            timeView.setTextSize(48);
            timeView.setTextColor(0xFFFFFFFF);
            timeView.setGravity(android.view.Gravity.CENTER);
            layout.addView(timeView);
            
            // Buttons
            android.widget.LinearLayout buttonLayout = new android.widget.LinearLayout(this);
            buttonLayout.setOrientation(android.widget.LinearLayout.HORIZONTAL);
            buttonLayout.setGravity(android.view.Gravity.CENTER);
            
            Button snoozeButton = new Button(this);
            snoozeButton.setText("SNOOZE");
            snoozeButton.setTextSize(16);
            snoozeButton.setBackgroundColor(0xFFFFA500);
            snoozeButton.setTextColor(0xFFFFFFFF);
            snoozeButton.setOnClickListener(v -> snoozeAlarm());
            
            Button dismissButton = new Button(this);
            dismissButton.setText("DISMISS");
            dismissButton.setTextSize(16);
            dismissButton.setBackgroundColor(0xFF00FF00);
            dismissButton.setTextColor(0xFFFFFFFF);
            dismissButton.setOnClickListener(v -> dismissAlarm());
            
            buttonLayout.addView(snoozeButton);
            buttonLayout.addView(dismissButton);
            layout.addView(buttonLayout);
            
            setContentView(layout);
            android.util.Log.d("AlarmActivity", "✅ [ACTIVITY] Fallback UI created successfully");
            
        } catch (Exception e) {
            android.util.Log.e("AlarmActivity", "❌ [ACTIVITY] Error creating fallback UI: " + e.getMessage(), e);
        }
    }
    
    private void setupFullScreenAlarm() {
        android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Setting up full screen alarm...");
        
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
        
        android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Window flags set");
        
        // Acquire wake lock to keep screen on
        PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
        wakeLock = powerManager.newWakeLock(
            PowerManager.FULL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP,
            "PlanMe:AlarmWakeLock"
        );
        wakeLock.acquire(10*60*1000L /*10 minutes*/);
        android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Wake lock acquired");
        
        // Dismiss keyguard if locked
        KeyguardManager keyguardManager = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
        if (keyguardManager.isKeyguardLocked()) {
            android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Keyguard is locked, requesting dismiss");
            keyguardManager.requestDismissKeyguard(this, null);
        } else {
            android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Keyguard is not locked");
        }
        
        android.util.Log.d("AlarmActivity", "✅ [ACTIVITY] Full screen alarm setup completed");
    }
    
    private void updateCurrentTime(TextView timeView) {
        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("h:mm a", java.util.Locale.getDefault());
        String currentTime = sdf.format(new java.util.Date());
        timeView.setText(currentTime);
    }
    
    private void startAlarm() {
        android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Starting alarm sound and vibration...");
        
        try {
            // Set volume to maximum like Google Clock
            android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Setting audio volume to maximum...");
            AudioManager audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
            int maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM);
            audioManager.setStreamVolume(AudioManager.STREAM_ALARM, maxVolume, 0);
            android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Volume set to: " + maxVolume);
            
            // Play alarm sound continuously
            android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Getting alarm sound URI...");
            Uri alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            if (alarmUri == null) {
                android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] No alarm sound, using ringtone...");
                alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
            }
            android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Sound URI: " + alarmUri);
            
            android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Creating MediaPlayer...");
            mediaPlayer = MediaPlayer.create(this, alarmUri);
            if (mediaPlayer == null) {
                android.util.Log.e("AlarmActivity", "❌ [ACTIVITY] MediaPlayer is null!");
                Toast.makeText(this, "❌ Error: Cannot create MediaPlayer", Toast.LENGTH_LONG).show();
                return;
            }
            
            mediaPlayer.setLooping(true);
            mediaPlayer.setAudioStreamType(AudioManager.STREAM_ALARM);
            android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Starting MediaPlayer...");
            mediaPlayer.start();
            android.util.Log.d("AlarmActivity", "✅ [ACTIVITY] MediaPlayer started successfully");
            
            // Start vibration pattern like Google Clock
            android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Starting vibration...");
            vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (vibrator != null && vibrator.hasVibrator()) {
                long[] pattern = {0, 1000, 1000, 1000, 1000, 1000};
                vibrator.vibrate(pattern, 0); // Repeat indefinitely
                android.util.Log.d("AlarmActivity", "✅ [ACTIVITY] Vibration started");
            } else {
                android.util.Log.w("AlarmActivity", "⚠️ [ACTIVITY] No vibrator available");
            }
            
            android.util.Log.d("AlarmActivity", "🚨 [ACTIVITY] Showing alarm toast...");
            Toast.makeText(this, "🚨 ALARM TRIGGERED! 🚨", Toast.LENGTH_LONG).show();
            android.util.Log.d("AlarmActivity", "✅ [ACTIVITY] Alarm started successfully!");
            
        } catch (Exception e) {
            android.util.Log.e("AlarmActivity", "❌ [ACTIVITY] Error starting alarm: " + e.getMessage(), e);
            Toast.makeText(this, "❌ Error starting alarm: " + e.getMessage(), Toast.LENGTH_LONG).show();
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
