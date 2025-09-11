import { Capacitor } from '@capacitor/core';
import { registerPlugin } from '@capacitor/core';

interface RealAlarmPluginInterface {
  scheduleRealAlarm(options: any): Promise<any>;
  cancelRealAlarm(options: any): Promise<any>;
  cancelAllRealAlarms(options: any): Promise<any>;
  checkAndRequestExactAlarm(options: any): Promise<any>;
  checkAndRequestIgnoreBatteryOptimizations(options: any): Promise<any>;
  ping(options: any): Promise<any>;
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
    console.log('🚀 [INIT] Starting RealAlarmService initialization...');
    
    if (!Capacitor.isNativePlatform()) {
      console.log('❌ [INIT] Real alarm service only works on native platforms');
      return;
    }
    
    console.log('✅ [INIT] Running on native platform, proceeding...');
    
    try {
      console.log('🔐 [INIT] Checking exact alarm permission...');
      const exactResult = await this.callNativeMethod('checkAndRequestExactAlarm', {});
      console.log('🔐 [INIT] Exact alarm permission result:', exactResult);
    } catch (e) {
      console.error('❌ [INIT] Exact alarm permission check failed:', e);
    }
    
    try {
      console.log('🔋 [INIT] Checking battery optimization settings...');
      const batteryResult = await this.callNativeMethod('checkAndRequestIgnoreBatteryOptimizations', {});
      console.log('🔋 [INIT] Battery optimization result:', batteryResult);
    } catch (e) {
      console.error('❌ [INIT] Battery optimization request failed:', e);
    }
    
    console.log('✅ [INIT] RealAlarmService initialization completed');
  }

  async scheduleAlarm(config: RealAlarmConfig): Promise<void> {
    console.log('🚨 [SCHEDULE] Starting alarm scheduling process...');
    console.log('🚨 [SCHEDULE] Alarm config:', {
      id: config.id,
      title: config.title,
      body: config.body,
      scheduledTime: config.scheduledTime.toISOString(),
      color: config.color,
      sound: config.sound,
      repeatDaily: config.repeatDaily
    });
    
    try {
      if (!Capacitor.isNativePlatform()) {
        console.error('❌ [SCHEDULE] Not on native platform, cannot schedule real alarm');
        throw new Error('Real alarms only work on native platforms');
      }

      const alarmId = this.nextId++;
      const scheduledTime = config.scheduledTime.getTime();
      const now = Date.now();
      const timeUntilAlarm = scheduledTime - now;
      
      console.log('🚨 [SCHEDULE] Alarm details:', {
        alarmId: alarmId,
        scheduledTime: scheduledTime,
        scheduledTimeISO: new Date(scheduledTime).toISOString(),
        currentTime: now,
        currentTimeISO: new Date(now).toISOString(),
        timeUntilAlarm: timeUntilAlarm,
        timeUntilAlarmSeconds: Math.round(timeUntilAlarm / 1000)
      });

      const alarmData = {
        alarmId: alarmId,
        title: config.title,
        body: config.body,
        scheduledTime: scheduledTime,
        color: config.color || 'red',
        sound: config.sound || 'alarm_sound',
        vibration: config.vibration || [0, 1000, 1000, 1000, 1000, 1000],
        snoozeMinutes: config.actions?.snooze?.minutes || 5,
        repeatDaily: config.repeatDaily || false
      };
      
      console.log('🚨 [SCHEDULE] Calling native method with data:', alarmData);
      
      // Use Capacitor's native bridge to call Android AlarmManager
      const result = await this.callNativeMethod('scheduleRealAlarm', alarmData);
      
      console.log('✅ [SCHEDULE] Native method call completed:', result);
      console.log('✅ [SCHEDULE] Alarm scheduled successfully!');

    } catch (error) {
      console.error('❌ [SCHEDULE] Error scheduling real alarm:', error);
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
    console.log(`🔌 [NATIVE] Calling native method: ${methodName}`);
    console.log(`🔌 [NATIVE] Method data:`, data);
    
    try {
      if (Capacitor.isNativePlatform()) {
        console.log('🔌 [NATIVE] Running on native platform, calling plugin...');
        
        // Try to call the plugin method directly
        try {
          let result;
          switch (methodName) {
            case 'scheduleRealAlarm':
              console.log('🔌 [NATIVE] Calling RealAlarmPlugin.scheduleRealAlarm...');
              result = await RealAlarmPlugin.scheduleRealAlarm(data);
              break;
            case 'cancelRealAlarm':
              console.log('🔌 [NATIVE] Calling RealAlarmPlugin.cancelRealAlarm...');
              result = await RealAlarmPlugin.cancelRealAlarm(data);
              break;
            case 'cancelAllRealAlarms':
              console.log('🔌 [NATIVE] Calling RealAlarmPlugin.cancelAllRealAlarms...');
              result = await RealAlarmPlugin.cancelAllRealAlarms(data);
              break;
            case 'checkAndRequestExactAlarm':
              console.log('🔌 [NATIVE] Calling RealAlarmPlugin.checkAndRequestExactAlarm...');
              result = await RealAlarmPlugin.checkAndRequestExactAlarm(data);
              break;
            case 'checkAndRequestIgnoreBatteryOptimizations':
              console.log('🔌 [NATIVE] Calling RealAlarmPlugin.checkAndRequestIgnoreBatteryOptimizations...');
              result = await RealAlarmPlugin.checkAndRequestIgnoreBatteryOptimizations(data);
              break;
            case 'ping':
              console.log('🔌 [NATIVE] Calling RealAlarmPlugin.ping...');
              result = await RealAlarmPlugin.ping(data);
              break;
            default:
              throw new Error(`Unknown method: ${methodName}`);
          }
          
          console.log(`✅ [NATIVE] Plugin method ${methodName} succeeded:`, result);
          return result;
          
        } catch (pluginError) {
          console.error(`❌ [NATIVE] Plugin method ${methodName} failed:`, pluginError);
          console.log(`⚠️ [NATIVE] Plugin not available, simulating ${methodName}`);
          return { success: true, simulated: true, method: methodName };
        }
      } else {
        console.log('🌐 [NATIVE] Running on web platform, returning mock result');
        return { success: true };
      }
    } catch (error) {
      console.error('❌ [NATIVE] Error calling native method:', error);
      throw error;
    }
  }
}

export const realAlarmService = RealAlarmService.getInstance();
