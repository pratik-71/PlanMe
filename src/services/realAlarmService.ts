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
    // This will be handled by the native Android code
    // For now, we'll use a simple approach with window object
    if (typeof (window as any).CapacitorWebView !== 'undefined') {
      return await (window as any).CapacitorWebView.postMessage({
        type: 'alarm',
        method: methodName,
        data: data
      });
    }
    
    // Fallback for testing
    console.log(`Native method call: ${methodName}`, data);
    return { success: true };
  }
}

export const realAlarmService = RealAlarmService.getInstance();
