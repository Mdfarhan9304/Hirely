import CardStack from '@/components/card-stack';
import SwipeActions from '@/components/swipe-actions';
import { useAuthStore } from '@/store/useAuthstore';
import { useCardStore } from '@/store/useCardStore';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { reset } = useCardStore();
  const { user, profile, logout, initialized } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  // Track component mount state
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // Redirect if not logged in or no profile
  useEffect(() => {
    if (!initialized || !isMounted) return
    
    if (!user) {
      console.log('🚀 Home: No user, redirecting to login');
      router.replace('/(auth)/login')
    } else if (!profile?.role) {
      console.log('🚀 Home: No profile, redirecting to onboarding');
      router.replace('/(auth)/onboarding')
    }
  }, [user, profile, initialized, isMounted])

  const handleSwipeComplete = () => {
    // Optional: Handle when all cards are swiped
    console.log('All cards swiped!');
  };

  const handleLogout = async () => {
    await logout();
    // Navigate to login screen after logout
    router.replace('/(auth)/login');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-red-500 items-center justify-center mr-3">
              <View className="w-8 h-8 rounded-full bg-pink-500" />
            </View>
            <View>
              <Text className="text-base font-bold text-gray-800">JobApp</Text>
              {profile && (
                <Text className="text-xs text-gray-500">
                  {profile.role === 'job_seeker' ? 'Job Seeker' : 'Employer'}
                </Text>
              )}
            </View>
          </View>
          <View className="flex-row items-center gap-4">
            {user && (
              <TouchableOpacity
                onPress={handleLogout}
                className="px-3 py-1 bg-red-500 rounded-lg"
              >
                <Text className="text-white text-sm font-medium">Logout</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Card Stack Container */}
        <View className="flex-1 justify-center">
          <CardStack onSwipeComplete={handleSwipeComplete} />
        </View>

        {/* Action Buttons - Add padding for tab bar */}
        <View className="pb-24">
          <SwipeActions />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
