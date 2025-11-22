import { getSupabaseClient } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthstore';
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
  
  const { user, profile } = useAuthStore();




  // Lazy load cards from Supabase when needed
  const fetchCardsFromSupabase = useCallback(async () => {
    if (loading || !hasMore) return;
    
    // Check user role and fetch appropriate cards
    if (!user || !profile?.role) {
      console.log('User not authenticated or no role, skipping card fetch');
      setHasMore(false);
      return;
    }

    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      let data: any[] | null = null;
      let error: any = null;

      if (profile.role === 'job_seeker') {
        // Job seekers see employers
        const result = await supabase
          .from('profiles')
          .select('user_id, role, company_name, company_size, company_description, full_name, profile_img, created_at, updated_at')
          .eq('role', 'employer')
          .neq('user_id', user.id) // Exclude current user
          .order('created_at', { ascending: false })
          .range(cards.length, cards.length + 9)
          .limit(10);
        
        data = result.data;
        error = result.error;

        if (error) {
          console.error('Error fetching employers:', error);
          setHasMore(false);
          return;
        }

        console.log('Fetched employers:', data?.length || 0, 'employers');

        if (data && data.length > 0) {
          // Transform employer profile data to CardData format
          const newCards: CardData[] = data
            .filter((item: any) => item.company_name) // Only include employers with company name
            .map((item: any) => ({
              id: item.user_id || item.id,
              name: item.company_name || 'Company',
              bio: item.company_description || 'No description available',
              images: [item.profile_img || 'https://via.placeholder.com/400'], // Default placeholder image
              job: item.company_name || 'Employer',
              jobTitle: item.company_name,
              location: 'Location not specified',
              // Store additional employer data for display
              companySize: item.company_size || 'Not specified',
              companyDescription: item.company_description,
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
      } else if (profile.role === 'employer') {
        // Employers see job seekers
        console.log('Fetching job seekers for employer:', user.id);
        console.log('Current cards length:', cards.length);
        
        // Fetch all job seekers (RLS policy now allows this)
        const result = await supabase
          .from('profiles')
          .select('user_id, role, full_name, first_name, last_name, qualification, resume_uri, resume_file_name, profile_img, created_at, updated_at')
          .eq('role', 'job_seeker')
          .order('created_at', { ascending: false });
        
        let allJobSeekers = result.data;
        error = result.error;

        if (error) {
          console.error('Error fetching job seekers:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          console.error('Error details:', JSON.stringify(error, null, 2));
          setHasMore(false);
          return;
        }

        console.log('Fetched job seekers (before filtering):', allJobSeekers?.length || 0, 'job seekers');
        
        // Filter out current user
        if (allJobSeekers && allJobSeekers.length > 0) {
          allJobSeekers = allJobSeekers.filter((item: any) => item.user_id !== user.id);
          console.log('After filtering current user:', allJobSeekers.length, 'job seekers');
          
          // Apply pagination manually
          const startIndex = cards.length;
          const endIndex = startIndex + 10;
          const paginatedData = allJobSeekers.slice(startIndex, endIndex);
          
          console.log('Paginated job seekers:', paginatedData.length, 'from', startIndex, 'to', endIndex);
          
          if (paginatedData.length > 0) {
            console.log('Sample job seeker data:', JSON.stringify(paginatedData[0], null, 2));
            data = paginatedData; // Use paginated data
          } else {
            data = []; // No more data
          }
        } else {
          console.log('No job seekers found in database');
          data = [];
        }

        if (data && data.length > 0) {
          // Transform job seeker profile data to CardData format
          const newCards: CardData[] = data.map((item: any) => {
            const fullName = item.full_name || 
              (item.first_name && item.last_name 
                ? `${item.first_name} ${item.last_name}`.trim()
                : item.first_name || item.last_name || 'Job Seeker');

            return {
              id: item.user_id || item.id,
              name: fullName,
              bio: item.qualification || 'No qualification specified',
              images: [item.profile_img || 'https://via.placeholder.com/400'], // Use profile image if available
              job: item.qualification || 'Job Seeker',
              jobTitle: item.qualification || 'Job Seeker',
              location: 'Location not specified',
              // Store job seeker specific data
              resumeUri: item.resume_uri || undefined,
              resumeFileName: item.resume_file_name || undefined,
              qualification: item.qualification || undefined,
            };
          });

          console.log('Created', newCards.length, 'cards from job seekers');

          if (cards.length === 0) {
            setCards(newCards);
          } else {
            addCards(newCards);
          }

          // Check if we have more data to load
          const totalAvailable = allJobSeekers?.length || 0;
          const totalFetched = cards.length + newCards.length;
          if (totalFetched >= totalAvailable || newCards.length < 10) {
            setHasMore(false);
          }
        } else {
          console.log('No job seeker cards to display');
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
  }, [cards.length, loading, hasMore, user, profile]);

  // Initialize cards on mount (lazy loading)
  useEffect(() => {
    if (cards.length === 0 && user && (profile?.role === 'job_seeker' || profile?.role === 'employer')) {
      fetchCardsFromSupabase();
    }
  }, [user, profile, cards.length, fetchCardsFromSupabase]);

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
    const loadingText = profile?.role === 'employer' 
      ? 'Loading job seekers...' 
      : 'Loading employers...';
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#50c8eb" />
        <Text className="mt-4 text-gray-500 font-poppins">{loadingText}</Text>
      </View>
    );
  }

  if (!currentCard) {
    if (!profile?.role || (profile.role !== 'job_seeker' && profile.role !== 'employer')) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text className="text-2xl font-bold text-gray-700 mb-2 font-poppins">Not Available</Text>
          <Text className="text-gray-500 font-poppins">Please complete your profile setup</Text>
        </View>
      );
    }
    const emptyText = profile.role === 'employer'
      ? 'No more job seekers!'
      : 'No more employers!';
    const emptySubtext = profile.role === 'employer'
      ? 'Check back later for new candidates'
      : 'Check back later for new opportunities';
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-gray-700 mb-2 font-poppins">{emptyText}</Text>
        <Text className="text-gray-500 font-poppins">{emptySubtext}</Text>
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

