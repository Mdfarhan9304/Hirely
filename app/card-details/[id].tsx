import { useCardStore } from '@/store/useCardStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, GraduationCap, MapPin, Users } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Animated, {
    useAnimatedScrollHandler,
    useSharedValue
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const IMG_HEIGHT = 400;

export default function CardDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { cards } = useCardStore();

    const card = cards.find(c => c.id === id);

    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });
    

    if (!card) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <Text className="text-lg text-gray-500">Card not found</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-4 px-6 py-3 bg-blue-500 rounded-full"
                >
                    <Text className="text-white font-semibold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const cardImage = card.images?.[0] || 'https://via.placeholder.com/400';

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Parallax Image Background */}
            <Animated.View
                style={[
                    { position: 'absolute', top: 0, left: 0, right: 0, height: IMG_HEIGHT },
                  
                ]}
            >
                <Image
                    source={{ uri: cardImage }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
                    className="absolute inset-0"
                />
            </Animated.View>

            {/* Fixed Back Button */}
            <TouchableOpacity
                onPress={() => router.back()}
                className="absolute top-12 left-4 p-2 bg-white/20 rounded-full backdrop-blur-md z-50"
            >
                <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>

            <Animated.ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingTop: IMG_HEIGHT-120 }}
            >
                {/* White Container with Rounded Corners */}
                <View className="bg-white rounded-t-[32px] min-h-screen">
                    {/* Title Section */}
                    <View className="px-6 pt-6 pb-4">
                        <Text className="text-gray-900 text-4xl font-bold mb-2">
                            {card.name}{card.age ? `, ${card.age}` : ''}
                        </Text>
                        <Text className="text-gray-600 text-xl font-medium">
                            {card.jobTitle || card.job}
                        </Text>
                    </View>

                    {/* Content */}
                    <View className="px-6 pb-8">
                    {/* Quick Info */}
                    <View className="flex-row flex-wrap gap-4 mb-8">
                        {card.location && (
                            <View className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-full">
                                <MapPin size={16} color="#666" className="mr-1.5" />
                                <Text className="text-gray-600">{card.location}</Text>
                            </View>
                        )}
                        {card.companySize && (
                            <View className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-full">
                                <Users size={16} color="#666" className="mr-1.5" />
                                <Text className="text-gray-600">{card.companySize} employees</Text>
                            </View>
                        )}
                        {card.qualification && (
                            <View className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-full">
                                <GraduationCap size={16} color="#666" className="mr-1.5" />
                                <Text className="text-gray-600">{card.qualification}</Text>
                            </View>
                        )}
                    </View>

                    {/* About Section */}
                    <View className="mb-8">
                        <Text className="text-xl font-bold text-gray-900 mb-3">About</Text>
                        <Text className="text-gray-600 text-base leading-7">
                            {card.bio || card.companyDescription || "No description available."}
                        </Text>
                    </View>

                    {/* Skills Section */}
                    {card.skills && card.skills.length > 0 && (
                        <View className="mb-8">
                            <Text className="text-xl font-bold text-gray-900 mb-4">Skills & Expertise</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {card.skills.map((skill, index) => (
                                    <View key={index} className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl">
                                        <Text className="text-blue-600 font-medium">{skill}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Additional Details */}
                    <View className="mb-24">
                        {/* Add more sections here as needed */}
                    </View>
                    </View>
                </View>
            </Animated.ScrollView>

            {/* Bottom Action Bar */}
            <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 shadow-lg">
                <View className="flex-row gap-4">
                    <TouchableOpacity className="flex-1 bg-gray-100 py-4 rounded-2xl items-center justify-center">
                        <Text className="text-gray-900 font-bold text-lg">Pass</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-blue-500 py-4 rounded-2xl items-center justify-center shadow-blue-500/30 shadow-lg">
                        <Text className="text-white font-bold text-lg">Connect</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
