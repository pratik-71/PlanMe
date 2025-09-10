import React, { useState, useEffect } from 'react';
import { alarmService, AlarmConfig } from '../services/alarmService';

interface AlarmComponentProps {
  alarmConfig: AlarmConfig;
  onAlarmTriggered?: (alarmId: string) => void;
  onAlarmSnoozed?: (alarmId: string, snoozeMinutes: number) => void;
  onAlarmDismissed?: (alarmId: string) => void;
  className?: string;
}

export const AlarmComponent: React.FC<AlarmComponentProps> = ({
  alarmConfig,
  onAlarmTriggered,
  onAlarmSnoozed,
  onAlarmDismissed,
  className = ''
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [timeUntilAlarm, setTimeUntilAlarm] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeAlarm();
  }, []);

  useEffect(() => {
    if (isScheduled && alarmConfig.scheduledTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const timeDiff = alarmConfig.scheduledTime.getTime() - now.getTime();
        
        if (timeDiff <= 0) {
          setTimeUntilAlarm(0);
          clearInterval(interval);
        } else {
          setTimeUntilAlarm(Math.ceil(timeDiff / 1000));
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isScheduled, alarmConfig.scheduledTime]);

  const initializeAlarm = async () => {
    try {
      setError(null);
      await alarmService.initialize();
      const permissions = await alarmService.checkPermissions();
      setHasPermission(permissions.display === 'granted');
      setIsInitialized(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to initialize alarm');
    }
  };

  const scheduleAlarm = async () => {
    try {
      setError(null);
      await alarmService.scheduleAlarm(alarmConfig);
      setIsScheduled(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to schedule alarm');
    }
  };

  const cancelAlarm = async () => {
    try {
      setError(null);
      // Find the notification ID for this alarm
      const pending = await alarmService.getPendingAlarms();
      const alarm = pending.find(a => a.extra?.originalId === alarmConfig.id);
      
      if (alarm) {
        await alarmService.cancelAlarm(alarm.id);
      }
      setIsScheduled(false);
      setTimeUntilAlarm(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to cancel alarm');
    }
  };

  const requestPermissions = async () => {
    try {
      setError(null);
      const permission = await alarmService.requestPermissions();
      setHasPermission(permission.display === 'granted');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to request permissions');
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

      {/* Alarm Body */}
      <p className="text-gray-700 mb-3">{alarmConfig.body}</p>

      {/* Time Until Alarm */}
      {isScheduled && timeUntilAlarm !== null && (
        <div className="mb-3 p-2 bg-white rounded border">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {timeUntilAlarm > 0 ? formatTime(timeUntilAlarm) : 'ALARM TRIGGERED!'}
            </div>
            <div className="text-sm text-gray-500">
              {timeUntilAlarm > 0 ? 'Time remaining' : 'Check your device for the alarm'}
            </div>
          </div>
        </div>
      )}

      {/* Alarm Actions */}
      <div className="flex space-x-2">
        {!hasPermission ? (
          <button
            onClick={requestPermissions}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Grant Alarm Permission
          </button>
        ) : !isScheduled ? (
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

      {/* Alarm Configuration Display */}
      <div className="mt-3 text-xs text-gray-500 space-y-1">
        {alarmConfig.color && <div>Color: {alarmConfig.color}</div>}
        {alarmConfig.sound && <div>Sound: {alarmConfig.sound}</div>}
        {alarmConfig.openPage && <div>Opens: {alarmConfig.openPage}</div>}
        {alarmConfig.repeatDaily && <div>Repeats: Daily</div>}
        {alarmConfig.actions?.snooze && (
          <div>Snooze: {alarmConfig.actions.snooze.title} ({alarmConfig.actions.snooze.minutes}min)</div>
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

