import { Ionicons } from '@expo/vector-icons';

export const TabsName: { label: string; icon: keyof typeof Ionicons.glyphMap; route: string }[] = [
  {
    label: 'Home',
    icon: 'home',
    route: 'index',
  },
  {
    label: 'Chat',
    icon: 'chatbubble',
    route: 'chat',
  },
  {
    label: 'Profile',
    icon: 'person',
    route: 'profiles',
  },
];

