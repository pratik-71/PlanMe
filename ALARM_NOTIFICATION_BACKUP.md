# 🚨 Alarm Notification System - Backup

## Overview
This is a complete alarm notification system built with React + Capacitor + TypeScript that creates real alarms that keep beeping until dismissed.

## Key Features
- ✅ **Real Alarms**: Keep beeping until dismissed (not just notifications)
- ✅ **Background Support**: Works when app is closed (Android APK)
- ✅ **Customizable**: Colors, sounds, vibrations, actions
- ✅ **Snooze Functionality**: Built-in snooze with custom durations
- ✅ **Action Buttons**: Snooze and Dismiss buttons
- ✅ **Page Navigation**: Can open specific pages when triggered
- ✅ **Repeat Support**: Daily repeating alarms

## File Structure

### 1. Alarm Service (`src/services/alarmService.ts`)
```typescript
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export interface AlarmConfig {
  id: string;
  title: string;
  body: string;
  scheduledTime: Date;
  color?: string;
  sound?: string;
  vibration?: number[];
  actions?: {
    snooze?: { title: string; minutes: number };
    dismiss?: { title: string };
  };
  openPage?: string;
  repeatDaily?: boolean;
}

export class AlarmService {
  // Singleton pattern
  private static instance: AlarmService;
  
  // Core methods
  async initialize(): Promise<void>
  async scheduleAlarm(config: AlarmConfig): Promise<void>
  async cancelAlarm(notificationId: number): Promise<void>
  async cancelAllAlarms(): Promise<void>
  async getPendingAlarms(): Promise<any[]>
  
  // Action handlers
  private async handleSnooze(notification: any): Promise<void>
  private async handleDismiss(notification: any): Promise<void>
}
```

### 2. Alarm Component (`src/components/AlarmComponent.tsx`)
```typescript
interface AlarmComponentProps {
  alarmConfig: AlarmConfig;
  onAlarmTriggered?: (alarmId: string) => void;
  onAlarmSnoozed?: (alarmId: string, snoozeMinutes: number) => void;
  onAlarmDismissed?: (alarmId: string) => void;
  className?: string;
}

export const AlarmComponent: React.FC<AlarmComponentProps>
```

### 3. Main App (`src/App.tsx`)
```typescript
// Example alarm configurations
const wakeUpAlarm = {
  id: 'wake-up-1',
  title: '🌅 Wake Up!',
  body: 'Time to start your day!',
  scheduledTime: new Date(Date.now() + 30 * 1000),
  color: 'red',
  sound: 'alarm_sound',
  vibration: [0, 1000, 1000, 1000, 1000, 1000],
  actions: {
    snooze: { title: 'Snooze 5min', minutes: 5 },
    dismiss: { title: 'Stop Alarm' }
  },
  openPage: '/home',
  repeatDaily: false
};
```

## Key Implementation Details

### Real Alarm Properties
```typescript
const notification = {
  title: config.title,
  body: config.body,
  id: this.nextId++,
  sound: config.sound || 'alarm_sound',
  actionTypeId: 'alarm',
  priority: 'high',                    // High priority
  importance: 'high',                  // High importance
  fullScreenIntent: true,              // Wakes device
  vibration: config.vibration || [0, 1000, 1000, 1000, 1000, 1000],
  actions: this.buildActions(config.actions),
  extra: {
    isAlarm: true,
    originalId: config.id,
    color: config.color,
    sound: config.sound,
    vibration: config.vibration,
    actions: config.actions,
    openPage: config.openPage,
    requiresInteraction: true          // Requires user interaction
  },
  schedule: {
    at: config.scheduledTime,
    repeats: config.repeatDaily || false,
    every: config.repeatDaily ? 'day' as const : undefined
  }
};
```

### Action Handlers
```typescript
// Snooze Handler
private async handleSnooze(notification: any): Promise<void> {
  await this.cancelAlarm(notification.id);
  
  const snoozeTime = new Date();
  const snoozeMinutes = notification.extra?.snoozeMinutes || 5;
  snoozeTime.setMinutes(snoozeTime.getMinutes() + snoozeMinutes);
  
  await this.scheduleAlarm({
    id: notification.extra?.originalId || notification.id,
    title: notification.title + ' (Snoozed)',
    body: `Alarm snoozed for ${snoozeMinutes} minutes`,
    scheduledTime: snoozeTime,
    // ... other config
  });
}

// Dismiss Handler
private async handleDismiss(notification: any): Promise<void> {
  await this.cancelAlarm(notification.id);
}
```

### Event Listeners
```typescript
// Setup notification handlers
LocalNotifications.addListener('localNotificationReceived', (notification) => {
  if (notification.extra?.isAlarm) {
    console.log('🚨 ALARM TRIGGERED!', notification);
  }
});

LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
  if (notification.actionId === 'snooze') {
    this.handleSnooze(notification.notification);
  } else if (notification.actionId === 'dismiss') {
    this.handleDismiss(notification.notification);
  }
});
```

## Usage Examples

### Basic Alarm
```typescript
const basicAlarm = {
  id: 'basic-1',
  title: 'Basic Alarm',
  body: 'This is a basic alarm',
  scheduledTime: new Date(Date.now() + 60000), // 1 minute
  color: 'red'
};

<AlarmComponent alarmConfig={basicAlarm} />
```

### Advanced Alarm with Custom Actions
```typescript
const advancedAlarm = {
  id: 'advanced-1',
  title: '💼 Meeting Reminder',
  body: 'You have a meeting in 5 minutes',
  scheduledTime: new Date(Date.now() + 300000), // 5 minutes
  color: 'blue',
  sound: 'meeting_sound',
  vibration: [0, 200, 200, 200],
  actions: {
    snooze: { title: 'Remind in 2min', minutes: 2 },
    dismiss: { title: 'Mark as Done' }
  },
  openPage: '/meeting-room',
  repeatDaily: false
};
```

### Daily Repeating Alarm
```typescript
const dailyAlarm = {
  id: 'daily-1',
  title: '🌅 Daily Wake Up',
  body: 'Time to wake up!',
  scheduledTime: new Date('2024-01-01T07:00:00'), // 7 AM
  color: 'yellow',
  repeatDaily: true
};
```

## Android APK Requirements

### Permissions
- Notification permissions must be granted
- Battery optimization should be disabled for the app
- Background activity should be allowed

### Configuration
```typescript
// In capacitor.config.ts
const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'PlanMe',
  webDir: 'build',
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav"
    }
  }
};
```

## Testing

### Web Testing
- Alarms only work when tab is open (browser limitation)
- Use for UI testing and development

### Android APK Testing
- Alarms work when app is closed
- Test background functionality
- Test snooze and dismiss actions
- Test different alarm configurations

## Troubleshooting

### Common Issues
1. **Alarms not working**: Check permissions
2. **No sound**: Verify sound file exists
3. **No vibration**: Check device vibration settings
4. **Actions not working**: Verify action handlers are set up

### Debug Commands
```typescript
// Check permissions
const permissions = await alarmService.checkPermissions();

// Get pending alarms
const pending = await alarmService.getPendingAlarms();

// Cancel all alarms
await alarmService.cancelAllAlarms();
```

## Dependencies

### Package.json
```json
{
  "dependencies": {
    "@capacitor/core": "^7.4.3",
    "@capacitor/local-notifications": "^7.0.3",
    "react": "^19.1.1",
    "gsap": "^3.13.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.3",
    "typescript": "^4.9.5"
  }
}
```

## Build Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Sync with Capacitor
npx cap sync

# Build Android APK
npx cap run android
```

## Notes

- This system is designed for Android APK usage
- Web version has limitations (browser security)
- Real alarms require native platform support
- All alarm configurations are flexible and customizable
- The system handles permissions automatically
- Snooze and dismiss actions are fully functional

---

**Created**: 2024-01-09  
**Version**: 1.0.0  
**Platform**: React + Capacitor + TypeScript

