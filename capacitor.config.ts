import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.planme.alarms',
  appName: 'PlanMe Real Alarms',
  webDir: 'build',
  plugins: {
    RealAlarm: {
      android: {
        enabled: true
      }
    }
  }
};

export default config;
