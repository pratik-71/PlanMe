import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import './index.css';
import { gsap } from 'gsap';
import { RealAlarmComponent } from './components/RealAlarmComponent';

function App() {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

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

  const addDebugInfo = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addDebugInfo('App initialized');
    addDebugInfo('Alarm service ready');
  }, []);

  const now = new Date();
  const alarmTime = new Date(now.getTime() + 30 * 1000); // 30 seconds from now

  const testAlarm = {
    id: 'test-alarm',
    title: 'Test Alarm',
    body: 'This is a test alarm!',
    scheduledTime: alarmTime,
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

  const handleAlarmTriggered = (alarmId: string) => {
    addDebugInfo(`🚨 ALARM TRIGGERED: ${alarmId}`);
  };

  const handleAlarmSnoozed = (alarmId: string, minutes: number) => {
    addDebugInfo(`⏰ ALARM SNOOZED: ${alarmId} for ${minutes} minutes`);
  };

  const handleAlarmDismissed = (alarmId: string) => {
    addDebugInfo(`✅ ALARM DISMISSED: ${alarmId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-2xl mx-auto p-6">
        <h1 ref={titleRef} className="text-3xl font-bold tracking-tight text-center">
          PlanMe Alarm
        </h1>

        <div ref={cardRef} className="mt-8">
          <RealAlarmComponent
            alarmConfig={testAlarm}
            onAlarmTriggered={handleAlarmTriggered}
            onAlarmSnoozed={handleAlarmSnoozed}
            onAlarmDismissed={handleAlarmDismissed}
          />
        </div>

        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Debug Info:</h3>
          <div className="text-sm text-gray-700 space-y-1 max-h-40 overflow-y-auto">
            {debugInfo.length === 0 ? (
              <p className="text-gray-500">No debug info yet...</p>
            ) : (
              debugInfo.map((info, index) => (
                <div key={index} className="font-mono text-xs">
                  {info}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;