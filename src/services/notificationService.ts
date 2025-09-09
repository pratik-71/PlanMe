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
  private nextId = 1;

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
        id: options.id || this.nextId++,
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
        id: options.id || this.nextId++,
        sound: options.sound || 'default',
        actionTypeId: options.actionTypeId || 'default',
        extra: options.extra || {},
        schedule: {
          at: options.schedule.at,
          repeats: options.schedule.repeats || false,
          every: options.schedule.every
        }
      };

      console.log('Scheduling notification with details:', {
        id: notification.id,
        title: notification.title,
        scheduledAt: notification.schedule.at.toISOString(),
        timeUntilNotification: Math.round((notification.schedule.at.getTime() - Date.now()) / 1000) + ' seconds'
      });

      await LocalNotifications.schedule({
        notifications: [notification]
      });

      console.log('✅ Scheduled notification created successfully:', notification);
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
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
        id: this.nextId++,
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
    const delaySeconds = Math.round(delayMinutes * 60);
    alarmTime.setSeconds(alarmTime.getSeconds() + delaySeconds);

    console.log(`Scheduling timely reminder for: ${alarmTime.toLocaleString()}`);
    console.log(`Current time: ${new Date().toLocaleString()}`);
    console.log(`Delay: ${delaySeconds} seconds (${delayMinutes} minutes)`);

    await this.scheduleNotification({
      title,
      body,
      id: this.nextId++,
      schedule: {
        at: alarmTime,
        repeats: false
      },
      extra: {
        type: 'timely_reminder',
        scheduledFor: alarmTime.toISOString(),
        delayMinutes,
        delaySeconds
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
        console.log(`Cancelled ${ids.length} notifications`);
      } else {
        console.log('No pending notifications to cancel');
      }
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

  async testNotificationSystem(): Promise<void> {
    try {
      console.log('🧪 Testing notification system...');
      
      // Test immediate notification
      console.log('1. Testing immediate notification...');
      await this.sendImmediateNotification({
        title: 'Test Immediate',
        body: 'This is a test immediate notification'
      });

      // Test scheduled notification (5 seconds)
      console.log('2. Testing scheduled notification (5 seconds)...');
      const testTime = new Date();
      testTime.setSeconds(testTime.getSeconds() + 5);
      
      await this.scheduleNotification({
        title: 'Test Scheduled',
        body: 'This is a test scheduled notification',
        schedule: {
          at: testTime,
          repeats: false
        }
      });

      console.log('✅ Notification system test completed');
    } catch (error) {
      console.error('❌ Notification system test failed:', error);
      throw error;
    }
  }
}

export const notificationService = NotificationService.getInstance();
