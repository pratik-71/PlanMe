import React, { useLayoutEffect, useRef, useEffect, useState } from 'react';
import './App.css';
import './index.css';
import { gsap } from 'gsap';
import { useNotificationStore } from './stores/notificationStore';
import { NotificationDebugger } from './components/NotificationDebugger';
import { WebNotificationTester } from './components/WebNotificationTester';

function App() {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [scheduledTime, setScheduledTime] = useState<Date | null>(null);
  const {
    isInitialized,
    hasPermission,
    pendingNotifications,
    error,
    initializeNotifications,
    requestPermissions,
    sendImmediateNotification,
    scheduleTimelyReminder,
    scheduleAlarmReminder,
    cancelAllNotifications,
    refreshPendingNotifications,
    clearError
  } = useNotificationStore();

  useLayoutEffect(() => {
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
    }
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.1, ease: 'power3.out' }
      );
    }
  }, []);

  useEffect(() => {
    initializeNotifications();
  }, [initializeNotifications]);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (countdown !== null && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown]);

  const handleImmediateNotification = async () => {
    await sendImmediateNotification(
      'Test Notification',
      'This is an immediate notification test!'
    );
  };

  const handleTimelyReminder = async () => {
    const delaySeconds = 10; // 10 seconds for testing
    const delayMinutes = delaySeconds / 60;
    
    // Set up countdown timer
    setCountdown(delaySeconds);
    setScheduledTime(new Date(Date.now() + delaySeconds * 1000));
    
    await scheduleTimelyReminder(
      'Timely Reminder',
      `This is a reminder scheduled for ${delaySeconds} seconds from now!`,
      delayMinutes
    );
  };

  const handleAlarmReminder = async () => {
    const delaySeconds = 30; // 30 seconds for testing
    const alarmTime = new Date();
    alarmTime.setSeconds(alarmTime.getSeconds() + delaySeconds);
    
    // Set up countdown timer
    setCountdown(delaySeconds);
    setScheduledTime(alarmTime);
    
    await scheduleAlarmReminder(
      'Alarm Reminder',
      `This is an alarm-type reminder that will work even when app is closed! (${delaySeconds}s)`,
      alarmTime,
      false
    );
  };

  const handleRequestPermissions = async () => {
    await requestPermissions();
    await refreshPendingNotifications();
  };

  const handleTestNotifications = async () => {
    try {
      const { notificationService } = await import('./services/notificationService');
      await notificationService.testNotificationSystem();
      alert('Test notifications sent! Check console for details.');
    } catch (error) {
      console.error('Test failed:', error);
      alert('Test failed. Check console for details.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-xl mx-auto p-6">
        <h1 ref={titleRef} className="text-3xl font-bold tracking-tight">
          PlanMe
        </h1>
        <p className="mt-2 text-gray-600">Personal planner with reliable, native notifications.</p>

        {/* Permission Status */}
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-lg font-semibold">Notification Status</h3>
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Initialized:</span>
              <span className={`text-sm font-medium ${isInitialized ? 'text-green-600' : 'text-red-600'}`}>
                {isInitialized ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Permission:</span>
              <span className={`text-sm font-medium ${hasPermission ? 'text-green-600' : 'text-red-600'}`}>
                {hasPermission ? 'Granted' : 'Denied'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending:</span>
              <span className="text-sm font-medium text-blue-600">
                {pendingNotifications.length}
              </span>
            </div>
          </div>
          
          {!hasPermission && (
            <button
              onClick={handleRequestPermissions}
              className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Request Notification Permission
            </button>
          )}
        </div>

        {/* Timer Display */}
        {countdown !== null && countdown > 0 && (
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="text-lg font-semibold text-blue-800">⏰ Notification Timer</h3>
            <div className="mt-2 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {countdown} seconds
              </div>
              {scheduledTime && (
                <div className="text-sm text-blue-600 mt-1">
                  Scheduled for: {scheduledTime.toLocaleTimeString()}
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-blue-500">
              Close the app to test background notifications!
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={clearError}
              className="mt-2 text-sm text-red-500 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Notification Tests */}
        <div ref={cardRef} className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Notification Tests</h2>
          <p className="mt-1 text-gray-600">Test different types of notifications:</p>

          <div className="mt-4 space-y-3">
            <button
              onClick={handleImmediateNotification}
              disabled={!hasPermission}
              className="w-full rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-gray-400"
            >
              1. Immediate Notification
            </button>

            <button
              onClick={handleTimelyReminder}
              disabled={!hasPermission || countdown !== null}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              2. Timely Reminder (10s delay)
            </button>

            <button
              onClick={handleAlarmReminder}
              disabled={!hasPermission || countdown !== null}
              className="w-full rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:bg-gray-400"
            >
              3. Alarm Reminder (30s, works when closed)
            </button>

            <button
              onClick={handleTestNotifications}
              disabled={!hasPermission}
              className="w-full rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:bg-gray-400"
            >
              🧪 Test Notification System
            </button>

            <button
              onClick={cancelAllNotifications}
              className="w-full rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            >
              Cancel All Notifications
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            <p>• Test on mobile device for full functionality</p>
            <p>• Close app after scheduling to test background notifications</p>
            <p>• Check notification panel for scheduled notifications</p>
          </div>
        </div>

        {/* Web Notification Tester */}
        <WebNotificationTester />

        {/* Notification Debugger */}
        <NotificationDebugger />
      </div>
    </div>
  );
}

export default App;
