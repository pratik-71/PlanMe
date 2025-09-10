package com.planme.alarms;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.getcapacitor.BridgeActivity;
import com.planme.alarms.RealAlarmPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register the RealAlarmPlugin
        Log.d("MainActivity", "Registering RealAlarmPlugin...");
        registerPlugin(RealAlarmPlugin.class);
        Log.d("MainActivity", "RealAlarmPlugin registered successfully");
    }
    
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        
        // Handle alarm intent
        if (intent != null && intent.getAction() != null) {
            if (intent.getAction().equals("com.planme.alarms.ALARM_TRIGGERED")) {
                // Launch alarm activity
                Intent alarmIntent = new Intent(this, AlarmActivity.class);
                alarmIntent.putExtra("title", intent.getStringExtra("title"));
                alarmIntent.putExtra("body", intent.getStringExtra("body"));
                alarmIntent.putExtra("alarmId", intent.getIntExtra("alarmId", -1));
                alarmIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                startActivity(alarmIntent);
            }
        }
    }
}
