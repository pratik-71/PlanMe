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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <h1 ref={titleRef} className="text-3xl font-bold tracking-tight">
            PlanMe Alarm
          </h1>
        </div>

        <div ref={cardRef} className="mt-8">
          <RealAlarmComponent
            alarmConfig={testAlarm}
          />
        </div>
      </div>
    </div>
  );
}

export default App;