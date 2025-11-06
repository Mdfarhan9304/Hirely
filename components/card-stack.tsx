import { getSupabaseClient } from '@/lib/supabase';
import { CardData, useCardStore } from '@/store/useCardStore';
import React, { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import SwipeCard from './swipe-card';

interface CardStackProps {
  onSwipeComplete?: () => void;
}

export default function CardStack({ onSwipeComplete }: CardStackProps) {
  const {
    cards,
    currentIndex,
    swipeCard,
    loadMoreCards,
    loading,
    hasMore,
    setCards,
    addCards,
    setLoading,
    setHasMore,
  } = useCardStore();

  // Lazy load cards from Supabase when needed
  const fetchCardsFromSupabase = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Example query - adjust based on your Supabase schema
      // This is a placeholder that you'll need to customize
      const { data, error } = await supabase
        .from('profiles') // Replace with your table name
        .select('*')
        .range(cards.length, cards.length + 10)
        .limit(10);

      if (error) {
        console.error('Error fetching cards:', error);
        // Fallback to mock data if Supabase is not configured
        setHasMore(false);
        return;
      }

      if (data && data.length > 0) {
        // Transform Supabase data to CardData format
        const newCards: CardData[] = data.map((item: any) => ({
          id: item.id,
          name: item.name || item.full_name || 'Unknown',
          age: item.age,
          bio: item.bio || item.about,
          images: item.images || item.avatar ? [item.avatar] : [],
          job: item.job || item.occupation,
          location: item.location || item.city,
        }));

        if (cards.length === 0) {
          setCards(newCards);
        } else {
          addCards(newCards);
        }

        if (newCards.length < 10) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error in fetchCardsFromSupabase:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [cards.length, loading, hasMore]);

  // Initialize cards on mount (lazy loading)
  useEffect(() => {
    if (cards.length === 0) {
      fetchCardsFromSupabase();
    }
  }, []);

  // Load more cards when we're close to running out
  useEffect(() => {
    const remainingCards = cards.length - currentIndex;
    if (remainingCards <= 2 && hasMore && !loading) {
      fetchCardsFromSupabase();
    }
  }, [currentIndex, cards.length, hasMore, loading]);

  const handleSwipe = useCallback(
    (direction: 'left' | 'right') => {
      if (cards[currentIndex]) {
        swipeCard(cards[currentIndex].id, direction);
        if (currentIndex === cards.length - 1) {
          onSwipeComplete?.();
        }
      }
    },
    [cards, currentIndex, swipeCard, onSwipeComplete]
  );

  // Display top 3 cards for layering effect
  const visibleCards = useMemo(() => {
    return cards
      .slice(currentIndex, currentIndex + 3)
      .map((card, index) => ({
        card,
        index,
      }));
  }, [cards, currentIndex]);

  const currentCard = cards[currentIndex];

  if (loading && cards.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#ef4444" />
        <Text className="mt-4 text-gray-500">Loading cards...</Text>
      </View>
    );
  }

  if (!currentCard) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-gray-700 mb-2">No more cards!</Text>
        <Text className="text-gray-500">Check back later for new matches</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center">
      {visibleCards.map(({ card, index }) => (
        <SwipeCard
          key={card.id}
          card={card}
          index={index}
          onSwipe={handleSwipe}
          isTopCard={index === 0}
        />
      ))}
    </View>
  );
}

