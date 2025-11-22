import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/useAuthstore';

export default function Index() {
  const { user, profile, initialized } = useAuthStore();

  // Wait for initialization
  if (!initialized) {
    return null;
  }

  // Redirect based on auth state
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!profile?.role) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}




















