import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { getIsAuthenticated } from '../_layout';

export default function AuthLayout() {
  const router = useRouter();

  useEffect(() => {
    // Nếu đã authenticated, redirect về dashboard
    if (getIsAuthenticated()) {
      router.replace('/(tabs)');
    }
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.neutral.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="otp-verification" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="user-info" />
    </Stack>
  );
}
