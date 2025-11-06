import { CardData } from '@/store/useCardStore';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Image, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
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
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

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
      
      // Scale down slightly while dragging
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
    const scale = interpolate(
      index,
      [0, 1],
      [0.95, 1],
      Extrapolate.CLAMP
    );
    return { transform: [{ scale }] };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: CARD_WIDTH,
            height: '85%',
            alignSelf: 'center',
            zIndex: 100 - index,
          },
          index === 0 ? cardStyle : nextCardStyle,
        ]}>
        <View className="flex-1 rounded-3xl overflow-hidden bg-white ">
          {/* Image */}
          <View className="flex-1 bg-gray-200">
            <Image
              source={{ uri: card.images[0] || 'https://via.placeholder.com/400' }}
              className="w-full h-full"
              resizeMode="cover"
            />
            
            {/* Gradient Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
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
            {card.job && (
              <Text className="text-white text-lg mb-1 opacity-90">
                {card.job}
              </Text>
            )}
            {card.location && (
              <Text className="text-white text-base mb-3 opacity-75">
                📍 {card.location}
              </Text>
            )}
            {card.bio && (
              <Text className="text-white text-base leading-5 opacity-90" numberOfLines={2}>
                {card.bio}
              </Text>
            )}
          </View>

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
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

