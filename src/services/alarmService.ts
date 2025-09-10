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
  private static instance: AlarmService;
  private isInitialized = false;
  private nextId = 1;

  static getInstance(): AlarmService {
    if (!AlarmService.instance) {
      AlarmService.instance = new AlarmService();
    }
    return AlarmService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (!Capacitor.isNativePlatform()) {
        console.log('Alarm service only works on native platforms');
        return;
      }

      const permission = await this.requestPermissions();
      if (permission.display !== 'granted') {
        throw new Error('Alarm permissions not granted');
      }

      await this.setupAlarmHandlers();
      this.isInitialized = true;
      console.log('🚨 Alarm service initialized');
    } catch (error) {
      console.error('Failed to initialize alarm service:', error);
      throw error;
    }
  }

  async requestPermissions(): Promise<{ display: string }> {
    try {
      const result = await LocalNotifications.requestPermissions();
      console.log('Alarm permissions:', result);
      
      // For Android 13+, we need to check if POST_NOTIFICATIONS is granted
      if (result.display === 'granted') {
        console.log('✅ Notification permissions granted');
      } else {
        console.warn('⚠️ Notification permissions denied:', result);
      }
      
      return result;
    } catch (error) {
      console.error('Error requesting alarm permissions:', error);
      throw error;
    }
  }

  private async setupAlarmHandlers(): Promise<void> {
    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      if (notification.extra?.isAlarm) {
        console.log('🚨 ALARM TRIGGERED!', notification);
        // Launch full-screen alarm activity
        this.launchAlarmActivity(notification);
      }
    });

    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      if (notification.actionId === 'snooze') {
        this.handleSnooze(notification.notification);
      } else if (notification.actionId === 'dismiss') {
        this.handleDismiss(notification.notification);
      }
    });
  }

  private async launchAlarmActivity(notification: any): Promise<void> {
    try {
      // This will be handled by the Android notification's fullScreenIntent
      // The AlarmActivity will be launched automatically when the alarm triggers
      console.log('🚨 Launching full-screen alarm activity for:', notification.title);
    } catch (error) {
      console.error('Error launching alarm activity:', error);
    }
  }

  private async handleSnooze(notification: any): Promise<void> {
    try {
      await this.cancelAlarm(notification.id);
      
      const snoozeTime = new Date();
      const snoozeMinutes = notification.extra?.snoozeMinutes || 5;
      snoozeTime.setMinutes(snoozeTime.getMinutes() + snoozeMinutes);
      
      await this.scheduleAlarm({
        id: notification.extra?.originalId || notification.id,
        title: notification.title + ' (Snoozed)',
        body: `Alarm snoozed for ${snoozeMinutes} minutes`,
        scheduledTime: snoozeTime,
        color: notification.extra?.color,
        sound: notification.extra?.sound,
        vibration: notification.extra?.vibration,
        actions: notification.extra?.actions,
        openPage: notification.extra?.openPage
      });
      
      console.log(`⏰ Alarm snoozed for ${snoozeMinutes} minutes`);
    } catch (error) {
      console.error('Error snoozing alarm:', error);
    }
  }

  private async handleDismiss(notification: any): Promise<void> {
    try {
      await this.cancelAlarm(notification.id);
      console.log('🔕 Alarm dismissed');
    } catch (error) {
      console.error('Error dismissing alarm:', error);
    }
  }

  async scheduleAlarm(config: AlarmConfig): Promise<void> {
    try {
      const notificationId = this.nextId++;
      const notification = {
        title: config.title,
        body: config.body,
        id: notificationId,
        sound: config.sound || 'alarm_sound',
        actionTypeId: 'alarm',
        priority: 'high',
        importance: 'high',
        fullScreenIntent: true,
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
          requiresInteraction: true,
          snoozeMinutes: config.actions?.snooze?.minutes || 5
        },
        schedule: {
          at: config.scheduledTime,
          repeats: config.repeatDaily || false,
          every: config.repeatDaily ? 'day' as const : undefined
        },
        // Android specific configuration for alarm behavior
        android: {
          channelId: 'alarm_channel',
          autoCancel: false, // Keep notification active until dismissed
          ongoing: true, // Make it an ongoing notification
          priority: 2, // PRIORITY_MAX
          vibrationPattern: config.vibration || [0, 1000, 1000, 1000, 1000, 1000],
          fullScreenIntent: true, // Show full-screen intent for alarms
          category: 'alarm',
          visibility: 'public',
          lights: true,
          lightColor: '#FF0000',
          sound: 'alarm_sound',
          // Intent to launch AlarmActivity
          intent: {
            action: 'android.intent.action.VIEW',
            extras: {
              title: config.title,
              body: config.body,
              notificationId: notificationId
            }
          }
        },
        // iOS specific configuration
        ios: {
          sound: 'alarm_sound.caf',
          badge: true,
          category: 'alarm'
        }
      };

      await LocalNotifications.schedule({
        notifications: [notification]
      });

      console.log('🚨 Alarm scheduled:', {
        id: config.id,
        title: config.title,
        scheduledFor: config.scheduledTime.toISOString(),
        color: config.color,
        openPage: config.openPage,
        notificationId: notification.id
      });
    } catch (error) {
      console.error('Error scheduling alarm:', error);
      throw error;
    }
  }

  private buildActions(actions?: AlarmConfig['actions']) {
    const notificationActions = [];
    
    if (actions?.snooze) {
      notificationActions.push({
        action: 'snooze',
        title: actions.snooze.title
      });
    }
    
    if (actions?.dismiss) {
      notificationActions.push({
        action: 'dismiss',
        title: actions.dismiss.title
      });
    }

    return notificationActions;
  }

  async cancelAlarm(notificationId: number): Promise<void> {
    try {
      await LocalNotifications.cancel({
        notifications: [{ id: notificationId }]
      });
      console.log('Alarm cancelled:', notificationId);
    } catch (error) {
      console.error('Error cancelling alarm:', error);
      throw error;
    }
  }

  async cancelAllAlarms(): Promise<void> {
    try {
      const pending = await this.getPendingAlarms();
      if (pending.length > 0) {
        const ids = pending.map(n => n.id);
        await LocalNotifications.cancel({
          notifications: ids.map(id => ({ id }))
        });
        console.log(`Cancelled ${ids.length} alarms`);
      }
    } catch (error) {
      console.error('Error cancelling all alarms:', error);
      throw error;
    }
  }

  async getPendingAlarms(): Promise<any[]> {
    try {
      const result = await LocalNotifications.getPending();
      return (result.notifications || []).filter(n => n.extra?.isAlarm);
    } catch (error) {
      console.error('Error getting pending alarms:', error);
      return [];
    }
  }

  async checkPermissions(): Promise<{ display: string }> {
    try {
      return await LocalNotifications.checkPermissions();
    } catch (error) {
      console.error('Error checking alarm permissions:', error);
      return { display: 'denied' };
    }
  }
}

export const alarmService = AlarmService.getInstance();

