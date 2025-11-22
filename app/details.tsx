import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, FileText } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type CardParam = {
  id: string;
  name: string;
  bio?: string;
  images?: string[];
  job?: string;
  jobTitle?: string;
  location?: string;
  qualification?: string;
  resumeUri?: string;
  resumeFileName?: string;
  companySize?: string;
  companyDescription?: string;
};

export default function DetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const card = useMemo<CardParam | null>(() => {
    if (!params?.card) return null;
    try {
      const parsed = typeof params.card === 'string' ? params.card : params.card[0];
      return JSON.parse(parsed) as CardParam;
    } catch (error) {
      console.error('Failed to parse card params:', error);
      return null;
    }
  }, [params.card]);

  const handleOpenResume = async () => {
    if (card?.resumeUri) {
      try {
        await Linking.openURL(card.resumeUri);
      } catch (error) {
        console.error('Unable to open resume:', error);
      }
    }
  };

  if (!card) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600 text-base">No details available.</Text>
      </SafeAreaView>
    );
  }

  const imageSource = card.images?.[0] || 'https://via.placeholder.com/400';

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ title: card.name || 'Details', headerShown: false }} />
      <ScrollView className="flex-1">
        <View className="relative h-96">
          <Image source={{ uri: imageSource }} className="w-full h-full" resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            className="absolute bottom-0 left-0 right-0 h-64"
          />
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-12 left-4 bg-black/50 rounded-full p-3"
            activeOpacity={0.8}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <View className="absolute bottom-6 left-6 right-6">
            <Text className="text-white text-3xl font-bold mb-2">{card.name}</Text>
            {card.location && (
              <Text className="text-white/80 text-base mb-1">📍 {card.location}</Text>
            )}
            {card.jobTitle && (
              <Text className="text-white text-lg font-semibold">{card.jobTitle}</Text>
            )}
          </View>
        </View>

        <View className="px-6 py-8 space-y-6">
          {card.qualification && (
            <View>
              <Text className="text-gray-900 text-xl font-bold mb-2">Qualification</Text>
              <Text className="text-gray-600 text-base">{card.qualification}</Text>
            </View>
          )}

          {(card.bio || card.companyDescription) && (
            <View>
              <Text className="text-gray-900 text-xl font-bold mb-2">About</Text>
              <Text className="text-gray-600 text-base leading-6">
                {card.companyDescription || card.bio}
              </Text>
            </View>
          )}

          {card.companySize && (
            <View className="flex-row items-center justify-between bg-gray-100 p-4 rounded-2xl">
              <Text className="text-gray-700 text-base">Company Size</Text>
              <Text className="text-gray-900 font-semibold">{card.companySize}</Text>
            </View>
          )}

          {card.resumeUri && (
            <TouchableOpacity
              onPress={handleOpenResume}
              className="flex-row items-center justify-center bg-[#50c8eb] py-4 rounded-2xl"
              activeOpacity={0.9}
            >
              <FileText size={22} color="#ffffff" />
              <Text className="text-white text-lg font-semibold ml-3">View Resume</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}






