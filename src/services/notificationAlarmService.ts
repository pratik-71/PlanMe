import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export interface NotificationAlarmConfig {
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

export class NotificationAlarmService {
  private static instance: NotificationAlarmService;
  private nextId = 1;

  static getInstance(): NotificationAlarmService {
    if (!NotificationAlarmService.instance) {
      NotificationAlarmService.instance = new NotificationAlarmService();
    }
    return NotificationAlarmService.instance;
  }

  async initialize(): Promise<void> {
    console.log('🚀 [NOTIFICATION] Starting NotificationAlarmService initialization...');
    
    try {
      // Request permissions
      const permissions = await LocalNotifications.requestPermissions();
      console.log('🔐 [NOTIFICATION] Permissions granted:', permissions);
      
      // Setup notification handlers
      LocalNotifications.addListener('localNotificationReceived', (notification) => {
        console.log('🚨 [NOTIFICATION] Alarm notification received:', notification);
      });

      LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        console.log('🎯 [NOTIFICATION] Action performed:', notification.actionId);
        if (notification.actionId === 'snooze') {
          this.handleSnooze(notification.notification);
        } else if (notification.actionId === 'dismiss') {
          this.handleDismiss(notification.notification);
        }
      });

      console.log('✅ [NOTIFICATION] NotificationAlarmService initialized successfully');
    } catch (error) {
      console.error('❌ [NOTIFICATION] Failed to initialize:', error);
    }
  }

  async scheduleAlarm(config: NotificationAlarmConfig): Promise<void> {
    console.log('🚨 [NOTIFICATION] Scheduling notification alarm...');
    
    try {
      const notification = {
        title: config.title,
        body: config.body,
        id: this.nextId++,
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
          requiresInteraction: true
        },
        schedule: {
          at: config.scheduledTime,
          repeats: config.repeatDaily || false,
          every: config.repeatDaily ? 'day' as const : undefined
        }
      };

      await LocalNotifications.schedule({ notifications: [notification] });
      console.log('✅ [NOTIFICATION] Alarm scheduled successfully!');
    } catch (error) {
      console.error('❌ [NOTIFICATION] Error scheduling alarm:', error);
      throw error;
    }
  }

  async cancelAlarm(notificationId: number): Promise<void> {
    try {
      await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
      console.log('✅ [NOTIFICATION] Alarm cancelled:', notificationId);
    } catch (error) {
      console.error('❌ [NOTIFICATION] Error cancelling alarm:', error);
      throw error;
    }
  }

  async cancelAllAlarms(): Promise<void> {
    try {
      // Get all pending notifications and cancel them
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        const ids = pending.notifications.map(n => n.id);
        await LocalNotifications.cancel({ notifications: ids.map(id => ({ id })) });
      }
      console.log('✅ [NOTIFICATION] All alarms cancelled');
    } catch (error) {
      console.error('❌ [NOTIFICATION] Error cancelling all alarms:', error);
      throw error;
    }
  }

  private buildActions(actions?: NotificationAlarmConfig['actions']) {
    const notificationActions = [];
    
    if (actions?.snooze) {
      notificationActions.push({
        id: 'snooze',
        title: actions.snooze.title,
        icon: 'snooze'
      });
    }
    
    if (actions?.dismiss) {
      notificationActions.push({
        id: 'dismiss',
        title: actions.dismiss.title,
        icon: 'close'
      });
    }
    
    return notificationActions;
  }

  private async handleSnooze(notification: any): Promise<void> {
    console.log('😴 [NOTIFICATION] Handling snooze...');
    await this.cancelAlarm(notification.id);
    
    const snoozeTime = new Date();
    const snoozeMinutes = notification.extra?.actions?.snooze?.minutes || 5;
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
      openPage: notification.extra?.openPage,
      repeatDaily: false
    });
  }

  private async handleDismiss(notification: any): Promise<void> {
    console.log('✅ [NOTIFICATION] Handling dismiss...');
    await this.cancelAlarm(notification.id);
  }
}

export const notificationAlarmService = NotificationAlarmService.getInstance();
