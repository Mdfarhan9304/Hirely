import { create } from 'zustand';

export interface CardData {
  id: string;
  name: string;
  age?: number;
  bio?: string;
  images: string[];
  job?: string;
  location?: string;
}

interface CardState {
  cards: CardData[];
  currentIndex: number;
  swipedCards: string[];
  likedCards: string[];
  passedCards: string[];
  loading: boolean;
  hasMore: boolean;
  
  // Actions
  setCards: (cards: CardData[]) => void;
  addCards: (cards: CardData[]) => void;
  swipeCard: (cardId: string, direction: 'left' | 'right') => void;
  reset: () => void;
  setLoading: (loading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  loadMoreCards: () => Promise<void>;
}

// Mock data for initial testing
const mockCards: CardData[] = [
  {
    id: '1',
    name: 'Sarah',
    age: 28,
    bio: 'Love traveling and trying new food! Coffee enthusiast ☕',
    images: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'],
    job: 'Product Designer',
    location: 'San Francisco, CA',
  },
  {
    id: '2',
    name: 'Emily',
    age: 26,
    bio: 'Fitness trainer and yoga instructor. Always up for an adventure!',
    images: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'],
    job: 'Fitness Coach',
    location: 'New York, NY',
  },
  {
    id: '3',
    name: 'Jessica',
    age: 29,
    bio: 'Photographer capturing moments one click at a time 📸',
    images: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'],
    job: 'Photographer',
    location: 'Los Angeles, CA',
  },
  {
    id: '4',
    name: 'Alex',
    age: 27,
    bio: 'Software engineer by day, chef by night 🍳',
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'],
    job: 'Software Engineer',
    location: 'Seattle, WA',
  },
  {
    id: '5',
    name: 'Morgan',
    age: 25,
    bio: 'Bookworm and nature lover. Let\'s explore together!',
    images: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'],
    job: 'Writer',
    location: 'Portland, OR',
  },
];

export const useCardStore = create<CardState>((set, get) => ({
  cards: mockCards,
  currentIndex: 0,
  swipedCards: [],
  likedCards: [],
  passedCards: [],
  loading: false,
  hasMore: true,

  setCards: (cards) => set({ cards, currentIndex: 0, swipedCards: [], likedCards: [], passedCards: [] }),
  
  addCards: (cards) => set((state) => ({ cards: [...state.cards, ...cards] })),
  
  swipeCard: (cardId, direction) => {
    const state = get();
    const isLiked = direction === 'right';
    
    set({
      swipedCards: [...state.swipedCards, cardId],
      likedCards: isLiked ? [...state.likedCards, cardId] : state.likedCards,
      passedCards: !isLiked ? [...state.passedCards, cardId] : state.passedCards,
      currentIndex: state.currentIndex + 1,
    });
  },

  reset: () => set({
    cards: mockCards,
    currentIndex: 0,
    swipedCards: [],
    likedCards: [],
    passedCards: [],
    hasMore: true,
  }),

  setLoading: (loading) => set({ loading }),
  
  setHasMore: (hasMore) => set({ hasMore }),

  loadMoreCards: async () => {
    const state = get();
    if (state.loading || !state.hasMore) return;
    
    set({ loading: true });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, fetch from Supabase here
    // For now, we'll just mark as no more cards
    set({ loading: false, hasMore: false });
  },
}));

