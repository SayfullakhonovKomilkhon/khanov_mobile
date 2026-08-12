import { Stack } from 'expo-router';
import { RoleGate } from '@/components/RoleGate';

export default function ParentLayout() {
  return (
    <RoleGate role="PARENT">
      <Stack screenOptions={{ headerShown: false }} />
    </RoleGate>
  );
}
