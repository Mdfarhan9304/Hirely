import { useAuthStore } from '@/store/useAuthstore';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatScreen() {
  const { user, profile, initialized } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!initialized || !isMounted) return;
    
    if (!user) {
      router.replace('/(auth)/login');
    } else if (!profile?.role) {
      router.replace('/(auth)/onboarding');
    }
  }, [user, profile, initialized, isMounted]);

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 items-center justify-center px-4 pb-24">
        <Text className="text-2xl font-bold text-gray-800 mb-2">Chat</Text>
        <Text className="text-gray-600 text-center">
          Your conversations will appear here
        </Text>
      </View>
    </SafeAreaView>
  );
}

