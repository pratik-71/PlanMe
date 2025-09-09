import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

interface DebugInfo {
  platform: string;
  isNative: boolean;
  permissions: any;
  pendingNotifications: any[];
  errors: string[];
  testResults: any[];
}

export const NotificationDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    platform: 'unknown',
    isNative: false,
    permissions: null,
    pendingNotifications: [],
    errors: [],
    testResults: []
  });

  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const errors: string[] = [];
    const testResults: any[] = [];

    try {
      // 1. Platform Detection
      const platform = Capacitor.getPlatform();
      const isNative = Capacitor.isNativePlatform();
      
      testResults.push({
        test: 'Platform Detection',
        status: 'success',
        details: `Platform: ${platform}, Native: ${isNative}`
      });

      // 2. Permission Check
      let permissions = null;
      try {
        permissions = await LocalNotifications.checkPermissions();
        testResults.push({
          test: 'Permission Check',
          status: 'success',
          details: `Permissions: ${JSON.stringify(permissions)}`
        });
      } catch (error) {
        errors.push(`Permission check failed: ${error}`);
        testResults.push({
          test: 'Permission Check',
          status: 'error',
          details: `Error: ${error}`
        });
      }

      // 3. Request Permissions
      try {
        const requestedPermissions = await LocalNotifications.requestPermissions();
        testResults.push({
          test: 'Request Permissions',
          status: 'success',
          details: `Requested: ${JSON.stringify(requestedPermissions)}`
        });
      } catch (error) {
        errors.push(`Permission request failed: ${error}`);
        testResults.push({
          test: 'Request Permissions',
          status: 'error',
          details: `Error: ${error}`
        });
      }

      // 4. Test Immediate Notification
      try {
        await LocalNotifications.schedule({
          notifications: [{
            title: 'Debug Test',
            body: 'This is a debug test notification',
            id: 999,
            sound: 'default'
          }]
        });
        testResults.push({
          test: 'Immediate Notification',
          status: 'success',
          details: 'Immediate notification scheduled successfully'
        });
      } catch (error) {
        errors.push(`Immediate notification failed: ${error}`);
        testResults.push({
          test: 'Immediate Notification',
          status: 'error',
          details: `Error: ${error}`
        });
      }

      // 5. Test Scheduled Notification
      try {
        const futureTime = new Date();
        futureTime.setSeconds(futureTime.getSeconds() + 5);
        
        await LocalNotifications.schedule({
          notifications: [{
            title: 'Debug Scheduled',
            body: 'This is a scheduled debug notification',
            id: 998,
            sound: 'default',
            schedule: {
              at: futureTime,
              repeats: false
            }
          }]
        });
        testResults.push({
          test: 'Scheduled Notification',
          status: 'success',
          details: `Scheduled for: ${futureTime.toISOString()}`
        });
      } catch (error) {
        errors.push(`Scheduled notification failed: ${error}`);
        testResults.push({
          test: 'Scheduled Notification',
          status: 'error',
          details: `Error: ${error}`
        });
      }

      // 6. Get Pending Notifications
      try {
        const pending = await LocalNotifications.getPending();
        testResults.push({
          test: 'Get Pending Notifications',
          status: 'success',
          details: `Found ${pending.notifications?.length || 0} pending notifications`
        });
      } catch (error) {
        errors.push(`Get pending notifications failed: ${error}`);
        testResults.push({
          test: 'Get Pending Notifications',
          status: 'error',
          details: `Error: ${error}`
        });
      }

      setDebugInfo({
        platform,
        isNative,
        permissions,
        pendingNotifications: [],
        errors,
        testResults
      });

    } catch (error) {
      errors.push(`Diagnostics failed: ${error}`);
      setDebugInfo(prev => ({
        ...prev,
        errors: [...prev.errors, ...errors],
        testResults: [...prev.testResults, ...testResults]
      }));
    } finally {
      setIsRunning(false);
    }
  };

  const clearAllNotifications = async () => {
    try {
      // Get all pending notifications and cancel them
      const pending = await LocalNotifications.getPending();
      if (pending.notifications && pending.notifications.length > 0) {
        const ids = pending.notifications.map(n => n.id);
        await LocalNotifications.cancel({
          notifications: ids.map(id => ({ id }))
        });
        alert(`Cleared ${ids.length} notifications`);
      } else {
        alert('No pending notifications to clear');
      }
    } catch (error) {
      alert(`Failed to clear notifications: ${error}`);
    }
  };

  const exportDebugInfo = () => {
    const debugData = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ...debugInfo
    };
    
    const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notification-debug.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">🔍 Notification Debugger</h2>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isRunning ? 'Running...' : 'Run Diagnostics'}
          </button>
          
          <button
            onClick={clearAllNotifications}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Clear All
          </button>
          
          <button
            onClick={exportDebugInfo}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Export Debug
          </button>
        </div>

        {/* Platform Info */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h3 className="font-semibold">Platform Information</h3>
          <p>Platform: <span className="font-mono">{debugInfo.platform}</span></p>
          <p>Native: <span className="font-mono">{debugInfo.isNative ? 'Yes' : 'No'}</span></p>
          <p>User Agent: <span className="font-mono text-xs">{navigator.userAgent}</span></p>
        </div>

        {/* Test Results */}
        {debugInfo.testResults.length > 0 && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="font-semibold mb-2">Test Results</h3>
            <div className="space-y-2">
              {debugInfo.testResults.map((result, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full ${
                    result.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <span className="font-medium">{result.test}:</span>
                  <span className="text-sm text-gray-600">{result.details}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Errors */}
        {debugInfo.errors.length > 0 && (
          <div className="bg-red-50 p-3 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Errors Found</h3>
            <div className="space-y-1">
              {debugInfo.errors.map((error, index) => (
                <div key={index} className="text-sm text-red-600 font-mono">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Android-Specific Debugging Tips */}
        <div className="bg-yellow-50 p-3 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Android Debugging Tips</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Check if app has notification permissions in Android Settings</li>
            <li>• Ensure app is not in battery optimization (Doze mode)</li>
            <li>• Check if notifications are enabled for the app</li>
            <li>• Verify Android version compatibility (API 21+)</li>
            <li>• Check if app is running in background</li>
            <li>• Test with different notification channels</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
