import { useCardStore } from '@/store/useCardStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

export default function SwipeActions() {
  const { cards, currentIndex, swipeCard } = useCardStore();

  const handlePass = () => {
    if (cards[currentIndex]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      swipeCard(cards[currentIndex].id, 'left');
    }
  };

  const handleLike = () => {
    if (cards[currentIndex]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      swipeCard(cards[currentIndex].id, 'right');
    }
  };

  if (!cards[currentIndex]) {
    return null;
  }

  return (
    <View className="flex-row items-center justify-center gap-8 pt-4">
      {/* Pass Button */}
      <TouchableOpacity
        onPress={handlePass}
        className="w-16 h-16 rounded-full bg-white border-2 border-gray-300 items-center justify-center "
        activeOpacity={0.7}>
        <Ionicons name="close" size={32} color="#ef4444" />
      </TouchableOpacity>

      {/* Super Like Button (Optional) */}
      <TouchableOpacity
        className="w-14 h-14 rounded-full bg-white border-2 border-blue-300 items-center justify-center "
        activeOpacity={0.7}>
        <Ionicons name="star" size={24} color="#3b82f6" />
      </TouchableOpacity>

      {/* Like Button */}
      <TouchableOpacity
        onPress={handleLike}
        className="w-16 h-16 rounded-full bg-white border-2 border-green-300 items-center justify-center "
        activeOpacity={0.7}>
        <Ionicons name="heart" size={32} color="#4ade80" />
      </TouchableOpacity>
    </View>
  );
}

