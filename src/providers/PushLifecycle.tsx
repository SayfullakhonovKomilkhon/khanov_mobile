import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { registerCurrentDeviceForPush, openNotificationTarget } from '@/lib/push';
import { useAuthStore } from '@/store/auth';

export function PushLifecycle() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (status !== 'authenticated' || !user) return;
    void registerCurrentDeviceForPush();

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      openNotificationTarget(user.role, response.notification.request.content.data);
    });

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) openNotificationTarget(user.role, response.notification.request.content.data);
    });

    return () => subscription.remove();
  }, [status, user]);

  return null;
}
