import { useAuthStore } from '@/store/useAuthstore';
import { router } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfilesScreen() {
  const { profile, user, logout, initialized } = useAuthStore();
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

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 px-4 pt-4 pb-24">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-gray-800">Profile</Text>
          <TouchableOpacity
            onPress={handleLogout}
            className="p-2 bg-red-50 rounded-full"
            activeOpacity={0.7}
          >
            <LogOut size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {profile && (
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <View className="mb-4">
              <Text className="text-sm text-gray-500 mb-1">Name</Text>
              <Text className="text-lg font-semibold text-gray-800">
                {profile.first_name} {profile.last_name}
              </Text>
            </View>

            {profile.role && (
              <View className="mb-4">
                <Text className="text-sm text-gray-500 mb-1">Role</Text>
                <Text className="text-lg font-semibold text-gray-800">
                  {profile.role === 'job_seeker' ? 'Job Seeker' : 'Employer'}
                </Text>
              </View>
            )}

            {profile.qualification && (
              <View className="mb-4">
                <Text className="text-sm text-gray-500 mb-1">Qualification</Text>
                <Text className="text-lg font-semibold text-gray-800">
                  {profile.qualification}
                </Text>
              </View>
            )}

            {user?.email && (
              <View className="mb-6">
                <Text className="text-sm text-gray-500 mb-1">Email</Text>
                <Text className="text-lg font-semibold text-gray-800">
                  {user.email}
                </Text>
              </View>
            )}

          </View>
        )}
      </View>
    </SafeAreaView>
  );
}


