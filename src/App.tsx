import React, { useLayoutEffect, useRef } from 'react';
import './index.css';
import { gsap } from 'gsap';
import { RealAlarmComponent } from './components/RealAlarmComponent';

function App() {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

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

  // Example alarm configurations
  const wakeUpAlarm = {
    id: 'wake-up-1',
    title: '🌅 Wake Up!',
    body: 'Time to start your day! This alarm will keep beeping until you dismiss it.',
    scheduledTime: new Date(Date.now() + 30 * 1000), // 30 seconds from now
    color: 'red',
    sound: 'alarm_sound',
    vibration: [0, 1000, 1000, 1000, 1000, 1000],
    actions: {
      snooze: { title: 'Snooze 5min', minutes: 5 },
      dismiss: { title: 'Stop Alarm' }
    },
    openPage: '/home',
    repeatDaily: false
  };

  const workoutAlarm = {
    id: 'workout-1',
    title: '💪 Workout Time!',
    body: 'Time for your daily workout. Get moving!',
    scheduledTime: new Date(Date.now() + 60 * 1000), // 1 minute from now
    color: 'blue',
    sound: 'alarm_sound',
    vibration: [0, 500, 500, 500],
    actions: {
      snooze: { title: 'Snooze 10min', minutes: 10 },
      dismiss: { title: 'Skip Workout' }
    },
    openPage: '/workout',
    repeatDaily: true
  };

  const meetingAlarm = {
    id: 'meeting-1',
    title: '📅 Meeting Reminder',
    body: 'You have a meeting in 5 minutes. Join now!',
    scheduledTime: new Date(Date.now() + 45 * 1000), // 45 seconds from now
    color: 'green',
    sound: 'alarm_sound',
    vibration: [0, 200, 200, 200, 200, 200],
    actions: {
      snooze: { title: 'Remind in 2min', minutes: 2 },
      dismiss: { title: 'Mark as Done' }
    },
    openPage: '/meeting',
    repeatDaily: false
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-2xl mx-auto p-6">
        <h1 ref={titleRef} className="text-3xl font-bold tracking-tight text-center">
          PlanMe Alarms
        </h1>
        <p className="mt-2 text-gray-600 text-center">
          Smart alarms that keep beeping until you dismiss them!
        </p>

        <div ref={cardRef} className="mt-8 space-y-6">
          {/* Wake Up Alarm */}
          <RealAlarmComponent
            alarmConfig={wakeUpAlarm}
            onAlarmTriggered={(alarmId) => console.log('Alarm triggered:', alarmId)}
            onAlarmSnoozed={(alarmId, minutes) => console.log('Alarm snoozed:', alarmId, minutes)}
            onAlarmDismissed={(alarmId) => console.log('Alarm dismissed:', alarmId)}
          />

          {/* Workout Alarm */}
          <RealAlarmComponent
            alarmConfig={workoutAlarm}
            onAlarmTriggered={(alarmId) => console.log('Workout alarm triggered:', alarmId)}
            onAlarmSnoozed={(alarmId, minutes) => console.log('Workout alarm snoozed:', alarmId, minutes)}
            onAlarmDismissed={(alarmId) => console.log('Workout alarm dismissed:', alarmId)}
          />

          {/* Meeting Alarm */}
          <RealAlarmComponent
            alarmConfig={meetingAlarm}
            onAlarmTriggered={(alarmId) => console.log('Meeting alarm triggered:', alarmId)}
            onAlarmSnoozed={(alarmId, minutes) => console.log('Meeting alarm snoozed:', alarmId, minutes)}
            onAlarmDismissed={(alarmId) => console.log('Meeting alarm dismissed:', alarmId)}
          />
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">📱 How to Test:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• <strong>Android APK:</strong> Alarms work when app is closed</li>
            <li>• <strong>Web:</strong> Only works when tab is open (browser limitation)</li>
            <li>• <strong>Real Alarms:</strong> Keep beeping until you dismiss them!</li>
            <li>• <strong>Actions:</strong> Snooze or Dismiss buttons on each alarm</li>
            <li>• <strong>Colors:</strong> Each alarm has its own color theme</li>
            <li>• <strong>Open Pages:</strong> Alarms can open specific pages when triggered</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;