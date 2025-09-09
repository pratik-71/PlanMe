import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export interface NotificationOptions {
  title: string;
  body: string;
  id?: number;
  schedule?: {
    at: Date;
    repeats?: boolean;
    every?: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
  };
  sound?: string;
  actionTypeId?: string;
  extra?: any;
}

export class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if notifications are supported
      if (!Capacitor.isNativePlatform()) {
        console.log('Local notifications not supported on web platform');
        return;
      }

      // Request permissions
      const permission = await this.requestPermissions();
      if (permission.display !== 'granted') {
        throw new Error('Notification permissions not granted');
      }

      // Set up notification handlers
      await this.setupNotificationHandlers();
      
      this.isInitialized = true;
      console.log('Notification service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      throw error;
    }
  }

  async requestPermissions(): Promise<{ display: string }> {
    try {
      const result = await LocalNotifications.requestPermissions();
      console.log('Notification permissions:', result);
      return result;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      throw error;
    }
  }

  private async setupNotificationHandlers(): Promise<void> {
    // Handle notification received while app is in foreground
    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('Notification received:', notification);
    });

    // Handle notification action performed
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log('Notification action performed:', notification);
    });
  }

  async sendImmediateNotification(options: Omit<NotificationOptions, 'schedule'>): Promise<void> {
    try {
      const notification = {
        title: options.title,
        body: options.body,
        id: options.id || Date.now(),
        sound: options.sound || 'default',
        actionTypeId: options.actionTypeId || 'default',
        extra: options.extra || {}
      };

      await LocalNotifications.schedule({
        notifications: [notification]
      });

      console.log('Immediate notification sent:', notification);
    } catch (error) {
      console.error('Error sending immediate notification:', error);
      throw error;
    }
  }

  async scheduleNotification(options: NotificationOptions): Promise<void> {
    try {
      if (!options.schedule) {
        throw new Error('Schedule options required for scheduled notifications');
      }

      const notification = {
        title: options.title,
        body: options.body,
        id: options.id || Date.now(),
        sound: options.sound || 'default',
        actionTypeId: options.actionTypeId || 'default',
        extra: options.extra || {},
        schedule: {
          at: options.schedule.at,
          repeats: options.schedule.repeats || false,
          every: options.schedule.every
        }
      };

      await LocalNotifications.schedule({
        notifications: [notification]
      });

      console.log('Scheduled notification created:', notification);
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  async scheduleAlarmReminder(
    title: string, 
    body: string, 
    alarmTime: Date, 
    repeatDaily: boolean = false
  ): Promise<void> {
    try {
      const notification = {
        title,
        body,
        id: Date.now(),
        sound: 'default', // Use default alarm sound
        actionTypeId: 'alarm',
        extra: {
          type: 'alarm',
          repeatDaily
        },
        schedule: {
          at: alarmTime,
          repeats: repeatDaily,
          every: repeatDaily ? 'day' as const : undefined
        }
      };

      await LocalNotifications.schedule({
        notifications: [notification]
      });

      console.log('Alarm reminder scheduled:', notification);
    } catch (error) {
      console.error('Error scheduling alarm reminder:', error);
      throw error;
    }
  }

  async scheduleTimelyReminder(
    title: string,
    body: string,
    delayMinutes: number
  ): Promise<void> {
    const alarmTime = new Date();
    alarmTime.setMinutes(alarmTime.getMinutes() + delayMinutes);

    await this.scheduleNotification({
      title,
      body,
      id: Date.now(),
      schedule: {
        at: alarmTime,
        repeats: false
      },
      extra: {
        type: 'timely_reminder'
      }
    });
  }

  async cancelNotification(notificationId: number): Promise<void> {
    try {
      await LocalNotifications.cancel({
        notifications: [{ id: notificationId }]
      });
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
      throw error;
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      // Get all pending notifications and cancel them
      const pending = await this.getPendingNotifications();
      if (pending.length > 0) {
        const ids = pending.map(n => n.id);
        await LocalNotifications.cancel({
          notifications: ids.map(id => ({ id }))
        });
      }
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
      throw error;
    }
  }

  async getPendingNotifications(): Promise<any[]> {
    try {
      const result = await LocalNotifications.getPending();
      return result.notifications || [];
    } catch (error) {
      console.error('Error getting pending notifications:', error);
      return [];
    }
  }

  async checkPermissions(): Promise<{ display: string }> {
    try {
      return await LocalNotifications.checkPermissions();
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return { display: 'denied' };
    }
  }
}

export const notificationService = NotificationService.getInstance();
