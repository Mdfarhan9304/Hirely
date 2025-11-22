import ResumeViewer from '@/components/ui/ResumeViewer';
import { CardData } from '@/store/useCardStore';
import { useRouter } from 'expo-router';
// lucide icons
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Download, FileText, Info } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, Image, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const SWIPE_THRESHOLD = 120;

interface SwipeCardProps {
  card: CardData;
  index: number;
  onSwipe: (direction: 'left' | 'right') => void;
  isTopCard: boolean;
}

export default function SwipeCard({ card, index, onSwipe, isTopCard }: SwipeCardProps) {
  const router = useRouter();
  const [showResumeViewer, setShowResumeViewer] = useState(false);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const isFlipped = useSharedValue(0);

  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .enabled(isTopCard)
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
      scale.value = 1 - Math.abs(event.translationX) / 1000;
    })
    .onEnd(() => {
      const swipeDistance = Math.abs(translateX.value);
      const shouldSwipe = swipeDistance > SWIPE_THRESHOLD;

      if (shouldSwipe) {
        const direction = translateX.value > 0 ? 'right' : 'left';
        translateX.value = withSpring(
          direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100,
          { damping: 20 }
        );
        translateY.value = withSpring(
          translateY.value + (Math.random() - 0.5) * 100,
          { damping: 20 }
        );
        runOnJS(onSwipe)(direction);
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        translateX.value = withSpring(0, { damping: 20 });
        translateY.value = withSpring(0, { damping: 20 });
        scale.value = withSpring(1, { damping: 20 });
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-15, 0, 15],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: `${rotateZ}deg` },
        { scale: scale.value },
      ],
    };
  });
  const combinedGesture = panGesture;

  const likeOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const nopeOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const nextCardStyle = useAnimatedStyle(() => {
    // Small offsets for scattered effect
    const OFFSET_X = (index % 2 === 0 ? -1 : 1) * (10 * index);
    const ROTATION = (index % 2 === 0 ? -1 : 1) * (3 * index);

    const scale = interpolate(
      index,
      [0, 1, 2],
      [0.95, 0.9, 0.85],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: OFFSET_X },
        { translateY: index * 8 },
        { rotateZ: `${ROTATION}deg` },
        { scale },
      ],
      opacity: interpolate(index, [0, 1, 2], [1, 0.9, 0.85]),
    };
  });

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(isFlipped.value, [0, 1], [0, 180]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: withTiming(`${spinValue}deg`, { duration: 500 }) }
      ],
      zIndex: isFlipped.value === 0 ? 1 : 0,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(isFlipped.value, [0, 1], [180, 360]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: withTiming(`${spinValue}deg`, { duration: 500 }) }
      ],
      zIndex: isFlipped.value === 1 ? 1 : 0,
    };
  });

  const handleFlip = () => {
    isFlipped.value = isFlipped.value === 0 ? 1 : 0;
  };

  const cardImage = card.images?.[0] || 'https://via.placeholder.com/400';

  return (
    <>
      <GestureDetector gesture={combinedGesture}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: CARD_WIDTH,
              height: '85%',
              alignSelf: 'center',
              zIndex: 100 - index,
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              elevation: 2,
            },
            index === 0 ? cardStyle : nextCardStyle,
          ]}>

          {/* Front Face */}
          <Animated.View
            style={[
              {
                backfaceVisibility: 'hidden',
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: '#fff',
                borderRadius: 26,
                overflow: 'hidden',
                borderWidth: 2,
                borderColor: '#50c8eb',
              },
              frontAnimatedStyle
            ]}
          >
            <Pressable
              onPress={handleFlip}
              className="flex-1"
            >
              {/* Image */}
              <View className="flex-1 bg-gray-200">
                <Image
                  source={{ uri: cardImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />

                {/* Gradient Overlay */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.9)']}
                  className="absolute bottom-0 left-0 right-0 h-64"
                />
              </View>

              {/* Info Section */}
              <View className="absolute bottom-0 left-0 right-0 p-6">
                <View className="flex-row items-center mb-2">
                  <Text className="text-white text-3xl font-bold mr-2">
                    {card.name}
                    {card.age && `, ${card.age}`}
                  </Text>
                </View>
                {card.jobTitle && (
                  <Text className="text-white text-lg mb-1 opacity-90">
                    {card.jobTitle}
                  </Text>
                )}
                {card.qualification && (
                  <Text className="text-white text-base mb-1 opacity-85">
                    🎓 {card.qualification}
                  </Text>
                )}
                {card.companySize && (
                  <Text className="text-white text-base mb-1 opacity-85">
                    👥 Company Size: {card.companySize}
                  </Text>
                )}
                {card.location && (
                  <Text className="text-white text-base mb-3 opacity-75">
                    📍 {card.location}
                  </Text>
                )}
                {(card.bio || card.companyDescription) && (
                  <Text className="text-white text-base leading-5 opacity-90" numberOfLines={3}>
                    {card.companyDescription || card.bio}
                  </Text>
                )}
              </View>
            </Pressable>

            {/* Like Overlay */}
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 50,
                  right: 20,
                  borderWidth: 4,
                  borderColor: '#4ade80',
                  borderRadius: 12,
                  padding: 20,
                  transform: [{ rotate: '15deg' }],
                },
                likeOverlayStyle,
              ]}>
              <Text className="text-4xl font-bold text-green-500">LIKE</Text>
            </Animated.View>

            {/* Nope Overlay */}
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 50,
                  left: 20,
                  borderWidth: 4,
                  borderColor: '#ef4444',
                  borderRadius: 12,
                  padding: 20,
                  transform: [{ rotate: '-15deg' }],
                },
                nopeOverlayStyle,
              ]}>
              <Text className="text-4xl font-bold text-red-500">NOPE</Text>
            </Animated.View>

            {/* View Resume button - Show for job seekers with resume */}
            {card.resumeUri && (
              <>
                <TouchableOpacity
                  onPress={handleFlip}
                  className="absolute bottom-6 right-24 p-4 bg-white rounded-full shadow-lg"
                  activeOpacity={0.8}
                >
                  <Info size={24} color="#50c8eb" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowResumeViewer(true)}
                  className="absolute bottom-6 right-5 p-4 bg-white rounded-full shadow-lg"
                  activeOpacity={0.8}
                >
                  <FileText size={24} color="#50c8eb" />
                </TouchableOpacity>
              </>
            )}

            {/* Company Details button - Show for employers */}
            {card.companySize && !card.resumeUri && (
              <TouchableOpacity
                onPress={handleFlip}
                className="absolute bottom-6 right-5 p-4 bg-white rounded-full shadow-lg"
              >
                <Download size={24} color="#50c8eb" />
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* Back Face */}
          <Animated.View
            style={[
              {
                backfaceVisibility: 'hidden',
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: '#fff',
                borderRadius: 26,
                overflow: 'hidden',
                borderWidth: 2,
                borderColor: '#50c8eb',
                padding: 24,
              },
              backAnimatedStyle
            ]}
          >
            <Pressable onPress={handleFlip} className="flex-1">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-800 mb-4">{card.name}</Text>

                <View className="flex-row flex-wrap gap-2 mb-6">
                  {card.jobTitle && (
                    <View className="bg-blue-100 px-3 py-1 rounded-full">
                      <Text className="text-blue-600">{card.jobTitle}</Text>
                    </View>
                  )}
                  {card.location && (
                    <View className="bg-gray-100 px-3 py-1 rounded-full">
                      <Text className="text-gray-600">{card.location}</Text>
                    </View>
                  )}
                </View>

                <Text className="text-lg font-semibold text-gray-800 mb-2">About</Text>
                <Text className="text-gray-600 text-base leading-6 mb-6" numberOfLines={4}>
                  {card.companyDescription || card.bio || "No description available."}
                </Text>

                {card.skills && card.skills.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-800 mb-2">Skills</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {card.skills.slice(0, 4).map((skill, i) => (
                        <View key={i} className="bg-gray-100 px-3 py-1 rounded-lg">
                          <Text className="text-gray-600 text-sm">{skill}</Text>
                        </View>
                      ))}
                      {card.skills.length > 4 && (
                        <View className="bg-gray-100 px-3 py-1 rounded-lg">
                          <Text className="text-gray-600 text-sm">+{card.skills.length - 4}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {card.companySize && (
                  <View className="mb-4">
                    <Text className="text-sm text-gray-500 mb-1">Company Size</Text>
                    <Text className="text-base text-gray-800">{card.companySize} Employees</Text>
                  </View>
                )}

                {card.qualification && (
                  <View className="mb-4">
                    <Text className="text-sm text-gray-500 mb-1">Qualification</Text>
                    <Text className="text-base text-gray-800">{card.qualification}</Text>
                  </View>
                )}
              </View>
            </Pressable>

            <View className="gap-3 mb-4">
              <TouchableOpacity
                onPress={() => {
                  router.push(`/card-details/${card.id}`);
                }}
                className="w-full py-3 bg-blue-500 rounded-xl items-center"
              >
                <Text className="text-white font-semibold text-lg">View Full Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleFlip}
                className="w-full py-3 bg-gray-100 rounded-xl items-center"
              >
                <Text className="text-gray-600 font-semibold">Close</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

        </Animated.View>
      </GestureDetector>


      {card.resumeUri && (
        <ResumeViewer
          visible={showResumeViewer}
          resumeUri={card.resumeUri}
          resumeFileName={card.resumeFileName}
          onClose={() => setShowResumeViewer(false)}
        />
      )}
    </>
  );
}
