import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e95645ad545b448cb8fa2332ea6708ba',
  appName: 'finwize.ai',
  webDir: 'dist',
  server: {
    url: 'https://e95645ad-545b-448c-b8fa-2332ea6708ba.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;