import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { api } from './api';
import { EAS_PROJECT_ID } from './config';
import type { Role } from '@/types/api';

const DEVICE_ID_KEY = 'khanovmath.deviceId';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function getDeviceId() {
  const saved = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (saved) return saved;
  const value = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  await SecureStore.setItemAsync(DEVICE_ID_KEY, value);
  return value;
}

export async function registerCurrentDeviceForPush() {
  if (!Device.isDevice || (Platform.OS !== 'ios' && Platform.OS !== 'android')) return null;
  if (!EAS_PROJECT_ID) return null;
  // Android remote notifications require Firebase native configuration.
  // Keep the rest of the app testable until google-services.json is added.
  if (Platform.OS === 'android' && !Constants.expoConfig?.android?.googleServicesFile) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'KhanovMath Academy',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 180, 250],
      lightColor: '#2650BB',
    });
  }

  const current = await Notifications.getPermissionsAsync();
  const permission = current.status === 'granted' ? current : await Notifications.requestPermissionsAsync();
  if (permission.status !== 'granted') return null;

  const token = (await Notifications.getExpoPushTokenAsync({ projectId: EAS_PROJECT_ID })).data;
  const deviceId = await getDeviceId();
  await api.post('/devices/push-token', {
    token,
    deviceId,
    platform: Platform.OS,
    appVersion: Constants.expoConfig?.version,
  });
  return token;
}

export async function unregisterCurrentDevice() {
  const deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (!deviceId) return;
  await api.delete(`/devices/${encodeURIComponent(deviceId)}`);
}

export function openNotificationTarget(role: Role, data: Record<string, unknown> | undefined) {
  const screen = typeof data?.screen === 'string' ? data.screen : 'notifications';
  const studentRoutes: Record<string, string> = {
    payment: '/(student)/payment',
    grades: '/(student)/(tabs)/grades',
    homework: '/(student)/(tabs)/homework',
    achievements: '/(student)/(tabs)/achievements',
    announcements: '/(student)/announcements',
    schedule: '/(student)/schedule',
    notifications: '/(student)/notifications',
  };
  const parentRoutes: Record<string, string> = {
    payment: '/(parent)/(tabs)/payment',
    grades: '/(parent)/(tabs)/grades',
    attendance: '/(parent)/(tabs)/attendance',
    homework: '/(parent)/homework',
    achievements: '/(parent)/achievements',
    announcements: '/(parent)/announcements',
    notifications: '/(parent)/notifications',
  };
  const routes = role === 'PARENT' ? parentRoutes : studentRoutes;
  router.push((routes[screen] ?? routes.notifications) as never);
}
