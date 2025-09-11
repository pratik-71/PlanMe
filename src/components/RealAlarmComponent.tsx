import React, { useState, useEffect } from 'react';
import { realAlarmService, RealAlarmConfig } from '../services/realAlarmService';

interface RealAlarmComponentProps {
  alarmConfig: RealAlarmConfig;
  className?: string;
}

export const RealAlarmComponent: React.FC<RealAlarmComponentProps> = ({
  alarmConfig,
  className = ''
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [timeUntilAlarm, setTimeUntilAlarm] = useState<number | null>(null);
  const [alarmTime, setAlarmTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    console.log('🎯 [COMPONENT] Initializing alarm component...');
    try {
      setError(null);
      console.log('🎯 [COMPONENT] Calling realAlarmService.initialize()...');
      await realAlarmService.initialize();
      console.log('✅ [COMPONENT] Alarm service initialized successfully');
      setIsInitialized(true);
    } catch (error) {
      console.error('❌ [COMPONENT] Failed to initialize alarm service:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize real alarm');
    }
  };

  const scheduleAlarm = async () => {
    console.log('🎯 [COMPONENT] Schedule alarm button clicked');
    console.log('🎯 [COMPONENT] Alarm config being scheduled:', alarmConfig);
    
    try {
      setError(null);
      console.log('🎯 [COMPONENT] Calling realAlarmService.scheduleAlarm()...');
      await realAlarmService.scheduleAlarm(alarmConfig);
      console.log('✅ [COMPONENT] Alarm scheduled successfully, updating UI state...');
      setIsScheduled(true);
      setAlarmTime(new Date(alarmConfig.scheduledTime));
      console.log('✅ [COMPONENT] UI state updated - alarm is now scheduled');
    } catch (error) {
      console.error('❌ [COMPONENT] Failed to schedule alarm:', error);
      setError(error instanceof Error ? error.message : 'Failed to schedule real alarm');
    }
  };

  const cancelAlarm = async () => {
    console.log('🎯 [COMPONENT] Cancel alarm button clicked');
    try {
      setError(null);
      console.log('🎯 [COMPONENT] Calling realAlarmService.cancelAllAlarms()...');
      // For now, we'll cancel all alarms since we don't have individual alarm tracking
      await realAlarmService.cancelAllAlarms();
      console.log('✅ [COMPONENT] Alarms cancelled successfully, updating UI state...');
      setIsScheduled(false);
      setTimeUntilAlarm(null);
      setAlarmTime(null);
      console.log('✅ [COMPONENT] UI state updated - alarm is now cancelled');
    } catch (error) {
      console.error('❌ [COMPONENT] Failed to cancel alarm:', error);
      setError(error instanceof Error ? error.message : 'Failed to cancel real alarm');
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
        <div className="animate-pulse">Initializing real alarm service...</div>
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

      {/* Alarm Body */}
      <p className="text-gray-700 mb-3">{alarmConfig.body}</p>

      {/* Alarm Time Preview */}
      {!isScheduled && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-center">
            <div className="text-sm text-blue-800 font-semibold mb-1">
              ⏰ Alarm will beep at:
            </div>
            <div className="text-lg font-mono text-blue-900">
              {alarmConfig.scheduledTime.toLocaleString()}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {Math.ceil((alarmConfig.scheduledTime.getTime() - new Date().getTime()) / 1000)} seconds from now
            </div>
          </div>
        </div>
      )}

      {/* Time Until Alarm */}
      {isScheduled && timeUntilAlarm !== null && (
        <div className="mb-3 p-4 bg-white rounded-lg border-2 border-red-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {timeUntilAlarm > 0 ? formatTime(timeUntilAlarm) : '🚨 ALARM TRIGGERED! 🚨'}
            </div>
            <div className="text-sm text-gray-600 mb-1">
              {timeUntilAlarm > 0 ? 'Time remaining until alarm beeps' : 'Check your device for the REAL ALARM!'}
            </div>
            {alarmTime && (
              <div className="text-xs text-gray-500 font-mono">
                Alarm will beep at: {alarmTime.toLocaleString()}
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
            Schedule REAL ALARM
          </button>
        ) : (
          <button
            onClick={cancelAlarm}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Cancel Real Alarm
          </button>
        )}
      </div>

      {/* Alarm Configuration Display */}
      <div className="mt-3 text-xs text-gray-500 space-y-1">
        {alarmConfig.color && <div>Color: {alarmConfig.color}</div>}
        {alarmConfig.sound && <div>Sound: {alarmConfig.sound}</div>}
        {alarmConfig.openPage && <div>Opens: {alarmConfig.openPage}</div>}
        {alarmConfig.repeatDaily && <div>Repeats: Daily</div>}
        {alarmConfig.actions?.snooze && (
          <div>Snooze: {alarmConfig.actions.snooze.title} ({alarmConfig.actions.snooze.minutes}min)</div>
        )}
        <div className="font-bold text-red-600">⚠️ REAL ALARM - Will keep beeping until dismissed!</div>
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
