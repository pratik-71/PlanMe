import { Capacitor } from '@capacitor/core';
import { registerPlugin } from '@capacitor/core';

interface RealAlarmPluginInterface {
  scheduleRealAlarm(options: any): Promise<any>;
  cancelRealAlarm(options: any): Promise<any>;
  cancelAllRealAlarms(options: any): Promise<any>;
}

const RealAlarmPlugin = registerPlugin<RealAlarmPluginInterface>('RealAlarm');

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
    try {
      // Verify native plugin availability
      // Capacitor will return false if the Android side has not registered the plugin
      const available = (Capacitor as any).isPluginAvailable
        ? (Capacitor as any).isPluginAvailable('RealAlarm')
        : true; // older Capacitor versions may not expose this, assume true
      if (!available) {
        console.error('❌ RealAlarm plugin is NOT available on native side. Ensure it is registered in MainActivity and app rebuilt.');
      } else {
        console.log('✅ RealAlarm plugin detected on native side.');
      }
    } catch (e) {
      console.warn('Could not verify native plugin availability:', e);
    }
    try {
      // Check exact alarm permission (Android 12+)
      const exact = await this.callNativeMethod('checkAndRequestExactAlarm', {});
      console.log('Exact alarm permission status:', exact);
    } catch (e) {
      console.warn('Exact alarm permission check failed:', e);
    }
    try {
      // Ask to ignore battery optimizations so alarms are reliable
      const battery = await this.callNativeMethod('checkAndRequestIgnoreBatteryOptimizations', {});
      console.log('Battery optimization status:', battery);
    } catch (e) {
      console.warn('Battery optimization request failed:', e);
    }
  }

  async scheduleAlarm(config: RealAlarmConfig): Promise<void> {
    try {
      if (!Capacitor.isNativePlatform()) {
        throw new Error('Real alarms only work on native platforms');
      }

      const alarmId = this.nextId++;
      const now = Date.now();

      // Normalize scheduled time: if it's in the past, roll it forward
      // - For repeating alarms, move to the next day at the same time
      // - For one-off alarms, schedule 60 seconds from now
      let scheduledDate = new Date(config.scheduledTime);
      if (scheduledDate.getTime() <= now) {
        if (config.repeatDaily) {
          const nextDay = new Date(scheduledDate);
          nextDay.setDate(nextDay.getDate() + 1);
          scheduledDate = nextDay;
        } else {
          scheduledDate = new Date(now + 60_000);
        }
      }
      const alarmTime = scheduledDate.getTime();
      console.log('Scheduling REAL alarm with normalized time:', {
        requested: config.scheduledTime.toISOString(),
        normalized: scheduledDate.toISOString(),
        repeatDaily: !!config.repeatDaily
      });

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
        scheduledFor: scheduledDate.toISOString(),
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
        console.log(`🚨 Calling native alarm method: ${methodName}`, data);
        
        // Call the actual native plugin
        switch (methodName) {
          case 'scheduleRealAlarm':
            return await RealAlarmPlugin.scheduleRealAlarm(data);
          case 'cancelRealAlarm':
            return await RealAlarmPlugin.cancelRealAlarm(data);
          case 'cancelAllRealAlarms':
            return await RealAlarmPlugin.cancelAllRealAlarms(data);
          default:
            throw new Error(`Unknown method: ${methodName}`);
        }
      } else {
        // Web fallback - just log for testing
        console.log(`Web fallback for method: ${methodName}`, data);
        return { success: true };
      }
    } catch (error) {
      console.error('Error calling native method:', error);
      throw error;
    }
  }
}

export const realAlarmService = RealAlarmService.getInstance();
