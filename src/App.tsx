import React, { useLayoutEffect, useRef, useEffect, useState } from 'react';
import './index.css';
import { gsap } from 'gsap';
import { RealAlarmComponent } from './components/RealAlarmComponent';
import { FallbackAlarmComponent } from './components/FallbackAlarmComponent';
import { Capacitor } from '@capacitor/core';

function App() {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [useFallback, setUseFallback] = useState(false);

  // Add debug logging
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugInfo(prev => [...prev.slice(-9), logMessage]); // Keep last 10 logs
  };

  useEffect(() => {
    addDebugLog('🚀 App component mounted');
    addDebugLog(`📱 Platform: ${Capacitor.getPlatform()}`);
    addDebugLog(`🌐 Is native: ${Capacitor.isNativePlatform()}`);
    addDebugLog(`🔧 Capacitor version: ${Capacitor.getPlatform()}`);
  }, []);

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
    title: '🚨 Test Alarm',
    body: 'This is a test alarm! Will trigger in 30 seconds.',
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

  // Test alarm service availability
  useEffect(() => {
    const testAlarmService = async () => {
      try {
        addDebugLog('🧪 Testing alarm service availability...');
        
        // Test if we can import the service
        const { realAlarmService } = await import('./services/realAlarmService');
        addDebugLog('✅ RealAlarmService imported successfully');
        
        // Test ping method (if available)
        try {
          // Try to call ping method if it exists
          if (typeof realAlarmService.ping === 'function') {
            const pingResult = await realAlarmService.ping();
            addDebugLog(`🏓 Ping result: ${JSON.stringify(pingResult)}`);
          } else {
            addDebugLog('🏓 Ping method not available');
          }
        } catch (pingError) {
          addDebugLog(`❌ Ping failed: ${pingError}`);
        }
        
      } catch (error) {
        addDebugLog(`❌ Service import failed: ${error}`);
        setUseFallback(true);
      }
    };
    
    testAlarmService();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <h1 ref={titleRef} className="text-3xl font-bold tracking-tight">
            PlanMe Alarm Debug
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Platform: {Capacitor.getPlatform()} | Native: {Capacitor.isNativePlatform() ? 'Yes' : 'No'}
          </p>
        </div>

        {/* Debug Info Panel */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-sm font-bold text-gray-700 mb-2">🔍 Debug Logs:</h3>
          <div className="text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
            {debugInfo.map((log, index) => (
              <div key={index} className="font-mono">{log}</div>
            ))}
          </div>
        </div>

        {/* Alarm Component */}
        <div ref={cardRef} className="mt-8">
          {useFallback ? (
            <div>
              <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Using Fallback Alarm Component (Real alarm failed)
                </p>
              </div>
              <FallbackAlarmComponent
                alarmConfig={testAlarm}
              />
            </div>
          ) : (
            <div>
              <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ Using Real Alarm Component (Native)
                </p>
              </div>
              <RealAlarmComponent
                alarmConfig={testAlarm}
              />
            </div>
          )}
        </div>

        {/* Manual Fallback Toggle */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setUseFallback(!useFallback);
              addDebugLog(`🔄 Switched to ${useFallback ? 'Real' : 'Fallback'} alarm component`);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            Switch to {useFallback ? 'Real' : 'Fallback'} Alarm
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;