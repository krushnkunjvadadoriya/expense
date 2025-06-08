import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="email-entry" />
      <Stack.Screen name="email-verification" />
      <Stack.Screen name="mobile-entry" />
      <Stack.Screen name="otp-verification" />
      <Stack.Screen name="registration-form" />
      <Stack.Screen name="setup-pin" />
      <Stack.Screen name="enter-pin" />
      <Stack.Screen name="forgot-pin" />
    </Stack>
  );
}