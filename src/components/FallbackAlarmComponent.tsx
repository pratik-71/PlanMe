import React, { useState, useEffect } from 'react';
import { notificationAlarmService, NotificationAlarmConfig } from '../services/notificationAlarmService';
import { realAlarmService, RealAlarmConfig } from '../services/realAlarmService';

interface FallbackAlarmComponentProps {
  alarmConfig: RealAlarmConfig;
  className?: string;
}

export const FallbackAlarmComponent: React.FC<FallbackAlarmComponentProps> = ({
  alarmConfig,
  className = ''
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [timeUntilAlarm, setTimeUntilAlarm] = useState<number | null>(null);
  const [alarmTime, setAlarmTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useNotificationFallback, setUseNotificationFallback] = useState(false);

  useEffect(() => {
    initializeAlarm();
  }, []);

  useEffect(() => {
    if (isScheduled && alarmTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const timeDiff = alarmTime.getTime() - now.getTime();
        
        if (timeDiff <= 0) {
          setTimeUntilAlarm(0);
          clearInterval(interval);
        } else {
          setTimeUntilAlarm(Math.ceil(timeDiff / 1000));
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isScheduled, alarmTime]);

  const initializeAlarm = async () => {
    console.log('🎯 [FALLBACK] Initializing fallback alarm component...');
    try {
      setError(null);
      
      // Try real alarm service first
      console.log('🎯 [FALLBACK] Trying real alarm service...');
      await realAlarmService.initialize();
      console.log('✅ [FALLBACK] Real alarm service initialized');
      setIsInitialized(true);
    } catch (error) {
      console.error('❌ [FALLBACK] Real alarm failed, trying notification fallback:', error);
      
      // Fallback to notification service
      try {
        await notificationAlarmService.initialize();
        setUseNotificationFallback(true);
        setIsInitialized(true);
        console.log('✅ [FALLBACK] Notification alarm service initialized');
      } catch (fallbackError) {
        console.error('❌ [FALLBACK] Both services failed:', fallbackError);
        setError('Failed to initialize alarm services');
      }
    }
  };

  const scheduleAlarm = async () => {
    console.log('🎯 [FALLBACK] Schedule alarm button clicked');
    
    try {
      setError(null);
      
      if (useNotificationFallback) {
        console.log('🎯 [FALLBACK] Using notification fallback...');
        const notificationConfig: NotificationAlarmConfig = {
          id: alarmConfig.id,
          title: alarmConfig.title,
          body: alarmConfig.body,
          scheduledTime: alarmConfig.scheduledTime,
          color: alarmConfig.color,
          sound: alarmConfig.sound,
          vibration: alarmConfig.vibration,
          actions: alarmConfig.actions,
          openPage: alarmConfig.openPage,
          repeatDaily: alarmConfig.repeatDaily
        };
        
        await notificationAlarmService.scheduleAlarm(notificationConfig);
        console.log('✅ [FALLBACK] Notification alarm scheduled');
      } else {
        console.log('🎯 [FALLBACK] Using real alarm service...');
        await realAlarmService.scheduleAlarm(alarmConfig);
        console.log('✅ [FALLBACK] Real alarm scheduled');
      }
      
      setIsScheduled(true);
      setAlarmTime(new Date(alarmConfig.scheduledTime));
      console.log('✅ [FALLBACK] Alarm scheduled successfully');
    } catch (error) {
      console.error('❌ [FALLBACK] Failed to schedule alarm:', error);
      
      // Try fallback if real alarm fails
      if (!useNotificationFallback) {
        console.log('🔄 [FALLBACK] Real alarm failed, trying notification fallback...');
        try {
          await notificationAlarmService.initialize();
          const notificationConfig: NotificationAlarmConfig = {
            id: alarmConfig.id,
            title: alarmConfig.title,
            body: alarmConfig.body,
            scheduledTime: alarmConfig.scheduledTime,
            color: alarmConfig.color,
            sound: alarmConfig.sound,
            vibration: alarmConfig.vibration,
            actions: alarmConfig.actions,
            openPage: alarmConfig.openPage,
            repeatDaily: alarmConfig.repeatDaily
          };
          
          await notificationAlarmService.scheduleAlarm(notificationConfig);
          setUseNotificationFallback(true);
          setIsScheduled(true);
          setAlarmTime(new Date(alarmConfig.scheduledTime));
          console.log('✅ [FALLBACK] Notification fallback successful');
        } catch (fallbackError) {
          console.error('❌ [FALLBACK] Both services failed:', fallbackError);
          setError('Failed to schedule alarm with both services');
        }
      } else {
        setError('Failed to schedule notification alarm');
      }
    }
  };

  const cancelAlarm = async () => {
    console.log('🎯 [FALLBACK] Cancel alarm button clicked');
    try {
      setError(null);
      
      if (useNotificationFallback) {
        await notificationAlarmService.cancelAllAlarms();
      } else {
        await realAlarmService.cancelAllAlarms();
      }
      
      setIsScheduled(false);
      setTimeUntilAlarm(null);
      setAlarmTime(null);
      console.log('✅ [FALLBACK] Alarm cancelled');
    } catch (error) {
      console.error('❌ [FALLBACK] Failed to cancel alarm:', error);
      setError('Failed to cancel alarm');
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getAlarmStyle = () => {
    const baseStyle = "p-4 rounded-lg border-2 transition-all duration-300";
    const colorStyle = alarmConfig.color ? `border-${alarmConfig.color}-500 bg-${alarmConfig.color}-50` : "border-red-500 bg-red-50";
    return `${baseStyle} ${colorStyle} ${className}`;
  };

  if (!isInitialized) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <div className="animate-pulse">Initializing alarm service...</div>
      </div>
    );
  }

  return (
    <div className={getAlarmStyle()}>
      {/* Alarm Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">
          🚨 {alarmConfig.title}
        </h3>
        <div className="text-sm text-gray-600">
          {alarmConfig.scheduledTime.toLocaleString()}
        </div>
      </div>

      {/* Service Type Indicator */}
      <div className="mb-3 p-2 bg-blue-100 rounded-lg border border-blue-200">
        <div className="text-sm text-blue-800">
          {useNotificationFallback ? 
            '📱 Using Notification Alarm (Fallback)' : 
            '🔔 Using Real Alarm (Native)'
          }
        </div>
      </div>

      {/* Alarm Body */}
      <p className="text-gray-700 mb-3">{alarmConfig.body}</p>

      {/* Time Until Alarm */}
      {isScheduled && timeUntilAlarm !== null && (
        <div className="mb-3 p-4 bg-white rounded-lg border-2 border-red-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {timeUntilAlarm > 0 ? formatTime(timeUntilAlarm) : '🚨 ALARM TRIGGERED! 🚨'}
            </div>
            <div className="text-sm text-gray-600 mb-1">
              {timeUntilAlarm > 0 ? 'Time remaining until alarm' : 'Check your device for the alarm!'}
            </div>
            {alarmTime && (
              <div className="text-xs text-gray-500 font-mono">
                Alarm will trigger at: {alarmTime.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alarm Actions */}
      <div className="flex space-x-2">
        {!isScheduled ? (
          <button
            onClick={scheduleAlarm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold"
          >
            Schedule Alarm
          </button>
        ) : (
          <button
            onClick={cancelAlarm}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Cancel Alarm
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};