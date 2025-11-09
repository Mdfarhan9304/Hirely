import { create } from 'zustand';

export interface CardData {
  id: string;
  name: string;
  age?: number;
  bio?: string;
  images: string[];
  job?: string;
  jobTitle?: string;
  location?: string;
  skills?: string[];
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
    name: 'Sarah Johnson',
    age: 28,
    bio: 'Front-end Developer with a strong eye for UI/UX and 5+ years of experience building responsive web applications using React and Tailwind CSS.',
    images: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'],
    jobTitle: 'Front-end Developer',
    location: 'San Francisco, CA',
    skills: ['React', 'Tailwind CSS', 'TypeScript', 'UI/UX'],
  },
  {
    id: '2',
    name: 'Emily Carter',
    age: 26,
    bio: 'Full-Stack Developer passionate about creating efficient and scalable applications using the MERN stack. Always eager to learn new technologies.',
    images: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'],
    jobTitle: 'Full-Stack Developer',
    location: 'New York, NY',
    skills: ['MongoDB', 'Express', 'React', 'Node.js'],
  },
  {
    id: '3',
    name: 'Jessica Miller',
    age: 29,
    bio: 'UI/UX Designer dedicated to designing intuitive and visually appealing digital experiences. Skilled in design systems and user research.',
    images: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'],
    jobTitle: 'UI/UX Designer',
    location: 'Los Angeles, CA',
    skills: ['Figma', 'Prototyping', 'Design Systems', 'User Research'],
  },
  {
    id: '4',
    name: 'Alex Brown',
    age: 27,
    bio: 'Software Engineer with expertise in backend development and cloud infrastructure. Focused on building high-performance, secure APIs.',
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'],
    jobTitle: 'Software Engineer',
    location: 'Seattle, WA',
    skills: ['Node.js', 'AWS', 'Docker', 'PostgreSQL'],
  },
  {
    id: '5',
    name: 'Morgan Lee',
    age: 25,
    bio: 'Mobile App Developer passionate about crafting smooth, scalable, and user-friendly applications using React Native and Firebase.',
    images: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'],
    jobTitle: 'React Native Developer',
    location: 'Portland, OR',
    skills: ['React Native', 'Firebase', 'Expo', 'JavaScript'],
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

