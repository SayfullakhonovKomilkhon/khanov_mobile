import { Stack } from 'expo-router';
import { RoleGate } from '@/components/RoleGate';

export default function StudentLayout() {
  return (
    <RoleGate role="STUDENT">
      <Stack screenOptions={{ headerShown: false }} />
    </RoleGate>
  );
}
