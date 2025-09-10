import { Capacitor } from '@capacitor/core';

export interface RealAlarmConfig {
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

export class RealAlarmService {
  private static instance: RealAlarmService;
  private nextId = 1;

  static getInstance(): RealAlarmService {
    if (!RealAlarmService.instance) {
      RealAlarmService.instance = new RealAlarmService();
    }
    return RealAlarmService.instance;
  }

  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Real alarm service only works on native platforms');
      return;
    }
    console.log('🚨 Real alarm service initialized');
  }

  async scheduleAlarm(config: RealAlarmConfig): Promise<void> {
    try {
      if (!Capacitor.isNativePlatform()) {
        throw new Error('Real alarms only work on native platforms');
      }

      const alarmId = this.nextId++;
      const alarmTime = config.scheduledTime.getTime();
      const now = Date.now();

      if (alarmTime <= now) {
        throw new Error('Alarm time must be in the future');
      }

      // Use Capacitor's native bridge to call Android AlarmManager
      const result = await this.callNativeMethod('scheduleRealAlarm', {
        alarmId: alarmId,
        title: config.title,
        body: config.body,
        scheduledTime: alarmTime,
        color: config.color || 'red',
        sound: config.sound || 'alarm_sound',
        vibration: config.vibration || [0, 1000, 1000, 1000, 1000, 1000],
        snoozeMinutes: config.actions?.snooze?.minutes || 5,
        repeatDaily: config.repeatDaily || false
      });

      console.log('🚨 REAL ALARM scheduled:', {
        id: config.id,
        alarmId: alarmId,
        title: config.title,
        scheduledFor: config.scheduledTime.toISOString(),
        result: result
      });

    } catch (error) {
      console.error('Error scheduling real alarm:', error);
      throw error;
    }
  }

  async cancelAlarm(alarmId: number): Promise<void> {
    try {
      if (!Capacitor.isNativePlatform()) {
        throw new Error('Real alarms only work on native platforms');
      }

      await this.callNativeMethod('cancelRealAlarm', { alarmId: alarmId });
      console.log('Real alarm cancelled:', alarmId);
    } catch (error) {
      console.error('Error cancelling real alarm:', error);
      throw error;
    }
  }

  async cancelAllAlarms(): Promise<void> {
    try {
      if (!Capacitor.isNativePlatform()) {
        throw new Error('Real alarms only work on native platforms');
      }

      await this.callNativeMethod('cancelAllRealAlarms', {});
      console.log('All real alarms cancelled');
    } catch (error) {
      console.error('Error cancelling all real alarms:', error);
      throw error;
    }
  }

  private async callNativeMethod(methodName: string, data: any): Promise<any> {
    try {
      if (Capacitor.isNativePlatform()) {
        // For now, we'll simulate the native call since the plugin needs to be properly registered
        // In a real implementation, this would call the native plugin
        console.log(`🚨 Native alarm method: ${methodName}`, data);
        
        // Simulate successful alarm scheduling
        if (methodName === 'scheduleRealAlarm') {
          // In a real app, this would call the native plugin
          // For testing, we'll just log and return success
          console.log('✅ Alarm would be scheduled natively:', data);
          return { success: true, alarmId: data.alarmId };
        }
        
        return { success: true };
      } else {
        // Web fallback - just log for testing
        console.log(`Native method call: ${methodName}`, data);
        return { success: true };
      }
    } catch (error) {
      console.error('Error calling native method:', error);
      throw error;
    }
  }
}

export const realAlarmService = RealAlarmService.getInstance();
