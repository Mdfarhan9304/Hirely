import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import { Animated, Pressable, Text } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  styleClassName?: string;
};

export default function GradientButton({ title, onPress, disabled, styleClassName }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handleIn = () =>
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  const handleOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], opacity: disabled ? 0.6 : 1 }}>
      <Pressable 
        onPress={onPress} 
        disabled={disabled} 
        onPressIn={handleIn} 
        onPressOut={handleOut} 
        className={`rounded-full overflow-hidden  ${styleClassName || ''}`}
      >
        <LinearGradient 
          colors={disabled ? ['#9ca3af', '#6b7280'] : ['#2563EB', '#3B82F6', '#60A5FA']} 
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 1 }} 
          className="py-5 items-center"
        >
          <Text className="text-white text-lg font-bold tracking-wide">{title}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}


