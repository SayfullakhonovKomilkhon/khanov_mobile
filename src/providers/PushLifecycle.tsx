import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { registerCurrentDeviceForPush, openNotificationTarget } from '@/lib/push';
import { useAuthStore } from '@/store/auth';

export function PushLifecycle() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (status !== 'authenticated' || !user) return;
    void registerCurrentDeviceForPush().catch(() => {
      // Push setup must never block access to the student or parent cabinet.
      // Registration will be attempted again on the next authenticated launch.
    });

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      openNotificationTarget(user.role, response.notification.request.content.data);
    });

    void Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response) openNotificationTarget(user.role, response.notification.request.content.data);
      })
      .catch(() => undefined);

    return () => subscription.remove();
  }, [status, user]);

  return null;
}
