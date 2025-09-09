import React, { useState, useEffect } from 'react';

interface WebNotificationTest {
  name: string;
  description: string;
  test: () => Promise<void>;
}

export const WebNotificationTester: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return;
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      addResult(`Permission request result: ${result}`);
    } catch (error) {
      addResult(`Permission request failed: ${error}`);
    }
  };

  const addResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const tests: WebNotificationTest[] = [
    {
      name: 'Basic Notification',
      description: 'Send a simple notification',
      test: async () => {
        if (permission !== 'granted') {
          addResult('❌ Permission not granted');
          return;
        }
        
        try {
          const notification = new Notification('Test Notification', {
            body: 'This is a test notification from the web app',
            icon: '/favicon.ico',
            tag: 'test-notification'
          });
          
          notification.onclick = () => {
            addResult('✅ Notification clicked');
            notification.close();
          };
          
          addResult('✅ Basic notification sent');
        } catch (error) {
          addResult(`❌ Basic notification failed: ${error}`);
        }
      }
    },
    {
      name: 'Scheduled Notification (5s)',
      description: 'Send a notification after 5 seconds',
      test: async () => {
        if (permission !== 'granted') {
          addResult('❌ Permission not granted');
          return;
        }
        
        addResult('⏰ Scheduling notification for 5 seconds...');
        
        setTimeout(() => {
          try {
            const notification = new Notification('Scheduled Notification', {
              body: 'This notification was scheduled 5 seconds ago',
              icon: '/favicon.ico',
              tag: 'scheduled-notification'
            });
            
            notification.onclick = () => {
              addResult('✅ Scheduled notification clicked');
              notification.close();
            };
            
            addResult('✅ Scheduled notification sent');
          } catch (error) {
            addResult(`❌ Scheduled notification failed: ${error}`);
          }
        }, 5000);
      }
    },
    {
      name: 'Multiple Notifications',
      description: 'Send 3 notifications with different tags',
      test: async () => {
        if (permission !== 'granted') {
          addResult('❌ Permission not granted');
          return;
        }
        
        try {
          for (let i = 1; i <= 3; i++) {
            setTimeout(() => {
              const notification = new Notification(`Notification ${i}`, {
                body: `This is notification number ${i}`,
                icon: '/favicon.ico',
                tag: `multi-notification-${i}`
              });
              
              notification.onclick = () => {
                addResult(`✅ Multi notification ${i} clicked`);
                notification.close();
              };
              
              addResult(`✅ Multi notification ${i} sent`);
            }, i * 1000); // 1 second apart
          }
        } catch (error) {
          addResult(`❌ Multiple notifications failed: ${error}`);
        }
      }
    },
    {
      name: 'Notification with Actions',
      description: 'Send notification with action buttons (if supported)',
      test: async () => {
        if (permission !== 'granted') {
          addResult('❌ Permission not granted');
          return;
        }
        
        try {
          const notification = new Notification('Action Notification', {
            body: 'This notification has action buttons',
            icon: '/favicon.ico',
            tag: 'action-notification',
            actions: [
              { action: 'view', title: 'View Details' },
              { action: 'dismiss', title: 'Dismiss' }
            ]
          });
          
          notification.onclick = () => {
            addResult('✅ Action notification clicked');
            notification.close();
          };
          
          addResult('✅ Action notification sent');
        } catch (error) {
          addResult(`❌ Action notification failed: ${error}`);
        }
      }
    }
  ];

  const runAllTests = async () => {
    clearResults();
    addResult('🚀 Starting all notification tests...');
    
    for (const test of tests) {
      addResult(`\n--- Running: ${test.name} ---`);
      await test.test();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
    }
    
    addResult('\n✅ All tests completed');
  };

  if (!isSupported) {
    return (
      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-red-800">❌ Notifications Not Supported</h2>
        <p className="text-red-600 mt-2">
          This browser doesn't support the Notification API. 
          Try using Chrome, Firefox, or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">🌐 Web Notification Tester</h2>
      
      <div className="space-y-4">
        {/* Permission Status */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h3 className="font-semibold">Permission Status</h3>
          <p className={`font-mono ${
            permission === 'granted' ? 'text-green-600' : 
            permission === 'denied' ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {permission === 'granted' ? '✅ Granted' : 
             permission === 'denied' ? '❌ Denied' : '⚠️ Default'}
          </p>
          {permission !== 'granted' && (
            <button
              onClick={requestPermission}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Request Permission
            </button>
          )}
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {tests.map((test, index) => (
            <button
              key={index}
              onClick={test.test}
              disabled={permission !== 'granted'}
              className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
            >
              <div className="font-medium">{test.name}</div>
              <div className="text-sm text-gray-600">{test.description}</div>
            </button>
          ))}
        </div>

        <button
          onClick={runAllTests}
          disabled={permission !== 'granted'}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
        >
          Run All Tests
        </button>

        {/* Results */}
        {testResults.length > 0 && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Test Results</h3>
              <button
                onClick={clearResults}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono text-gray-700">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Android Debugging Info */}
        <div className="bg-yellow-50 p-3 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Android APK Debugging</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>• <strong>Web notifications work differently than native notifications</strong></p>
            <p>• <strong>For Android APK:</strong> Use the "Run Diagnostics" button above</p>
            <p>• <strong>Common Android issues:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• App not in foreground when scheduling</li>
              <li>• Battery optimization blocking background tasks</li>
              <li>• Notification channels not properly configured</li>
              <li>• Android version compatibility issues</li>
              <li>• App permissions not granted</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
