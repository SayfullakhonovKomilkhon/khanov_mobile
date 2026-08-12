import Constants from 'expo-constants';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'https://api.khanovmathacademy.uz';

export const EAS_PROJECT_ID =
  process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
  Constants.expoConfig?.extra?.eas?.projectId ||
  Constants.easConfig?.projectId;
