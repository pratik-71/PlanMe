import { create } from 'zustand';
import { notificationService } from '../services/notificationService';

interface NotificationState {
  isInitialized: boolean;
  hasPermission: boolean;
  pendingNotifications: any[];
  error: string | null;
  initializeNotifications: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  sendImmediateNotification: (title: string, body: string) => Promise<void>;
  scheduleTimelyReminder: (title: string, body: string, delayMinutes: number) => Promise<void>;
  scheduleAlarmReminder: (title: string, body: string, alarmTime: Date, repeatDaily?: boolean) => Promise<void>;
  cancelNotification: (id: number) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  refreshPendingNotifications: () => Promise<void>;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  isInitialized: false,
  hasPermission: false,
  pendingNotifications: [],
  error: null,

  initializeNotifications: async () => {
    try {
      set({ error: null });
      await notificationService.initialize();
      const permissions = await notificationService.checkPermissions();
      const pending = await notificationService.getPendingNotifications();
      
      set({ 
        isInitialized: true, 
        hasPermission: permissions.display === 'granted',
        pendingNotifications: pending
      });
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to initialize notifications' });
    }
  },

  requestPermissions: async () => {
    try {
      set({ error: null });
      const permissions = await notificationService.requestPermissions();
      const hasPermission = permissions.display === 'granted';
      set({ hasPermission });
      return hasPermission;
    } catch (error) {
      console.error('Failed to request permissions:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to request permissions' });
      return false;
    }
  },

  sendImmediateNotification: async (title: string, body: string) => {
    try {
      set({ error: null });
      await notificationService.sendImmediateNotification({ title, body });
    } catch (error) {
      console.error('Failed to send immediate notification:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to send notification' });
    }
  },

  scheduleTimelyReminder: async (title: string, body: string, delayMinutes: number) => {
    try {
      set({ error: null });
      await notificationService.scheduleTimelyReminder(title, body, delayMinutes);
      await get().refreshPendingNotifications();
    } catch (error) {
      console.error('Failed to schedule timely reminder:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to schedule reminder' });
    }
  },

  scheduleAlarmReminder: async (title: string, body: string, alarmTime: Date, repeatDaily = false) => {
    try {
      set({ error: null });
      await notificationService.scheduleAlarmReminder(title, body, alarmTime, repeatDaily);
      await get().refreshPendingNotifications();
    } catch (error) {
      console.error('Failed to schedule alarm reminder:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to schedule alarm' });
    }
  },

  cancelNotification: async (id: number) => {
    try {
      set({ error: null });
      await notificationService.cancelNotification(id);
      await get().refreshPendingNotifications();
    } catch (error) {
      console.error('Failed to cancel notification:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to cancel notification' });
    }
  },

  cancelAllNotifications: async () => {
    try {
      set({ error: null });
      await notificationService.cancelAllNotifications();
      set({ pendingNotifications: [] });
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to cancel notifications' });
    }
  },

  refreshPendingNotifications: async () => {
    try {
      const pending = await notificationService.getPendingNotifications();
      set({ pendingNotifications: pending });
    } catch (error) {
      console.error('Failed to refresh pending notifications:', error);
    }
  },

  clearError: () => set({ error: null }),
}));
