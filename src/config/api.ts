import { Platform } from 'react-native';

// In development:
// - Android Emulator uses 10.0.2.2 to access host machine localhost
// - iOS Simulator and Web use localhost
// - For physical devices on the same Wi-Fi network, replace with your computer's local IP (e.g., 192.168.1.X:5000)
const getDevHost = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }
  return 'http://localhost:5000';
};

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || `${getDevHost()}/api`,
  HEALTH_URL: `${getDevHost()}/health`,
  TIMEOUT: 8000,
};
