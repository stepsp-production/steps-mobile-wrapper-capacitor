import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.steps.presinter',
  appName: 'Steps Presinter',
  webDir: 'www',
  server: {
    // Capacitor serves your app at capacitor://localhost (iOS) and http://localhost (Android)
    iosScheme: 'capacitor',
    androidScheme: 'http',
    allowNavigation: [
      'hls-proxy.it-f2c.workers.dev',
      '*.trycloudflare.com',
      'steps-presinter.onrender.com',
      'cdn.jsdelivr.net',
      'unpkg.com',
      '*.livekit.cloud'
    ]
  }
};

export default config;
