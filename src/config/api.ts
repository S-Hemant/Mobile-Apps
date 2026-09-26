import { Platform, NativeModules } from 'react-native';

const getDevHost = () => {
  // If running via Expo Go on physical device or emulator, automatically extract host IP from Metro scriptURL:
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/https?:\/\/([^:\/]+)/);
    if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
      return `http://${match[1]}:5000`;
    }
  }

  // Fallback to local network IP of host machine for physical Android devices over Wi-Fi:
  if (Platform.OS === 'android') {
    return 'http://192.168.1.16:5000';
  }

  return 'http://localhost:5000';
};

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || `${getDevHost()}/api`,
  HEALTH_URL: `${getDevHost()}/health`,
  TIMEOUT: 15000,
};
