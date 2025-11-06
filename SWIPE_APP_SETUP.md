# Tinder-Style Swipe App

A Tinder-style swipeable card app built with React Native, Zustand, NativeWind, and Supabase.

## Features

- ✅ **Swipeable Cards**: Smooth, animated card swiping with gesture handling
- ✅ **Zustand State Management**: Efficient state management for cards, swipes, and preferences
- ✅ **NativeWind Styling**: Beautiful UI with Tailwind CSS classes
- ✅ **Supabase Integration**: Backend ready for user profiles and data (with lazy loading)
- ✅ **Lazy Loading**: Cards load progressively as you swipe
- ✅ **Haptic Feedback**: Touch feedback for swipes and interactions

## Project Structure

```
app/
  (tabs)/
    index.tsx          # Main swipe screen
components/
  swipe-card.tsx      # Individual swipeable card component
  card-stack.tsx      # Card stack builder with lazy loading
  swipe-actions.tsx   # Action buttons (pass/like)
store/
  useCardStore.ts     # Zustand store for card state
  useAuthstore.tsx    # Authentication store
lib/
  supabase.ts         # Supabase client configuration
```

## Setup Instructions

### 1. Supabase Configuration (Optional)

The app works with mock data by default. To connect to Supabase:

1. Create a Supabase project at https://supabase.com
2. Create a `profiles` table:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  age INTEGER,
  bio TEXT,
  images TEXT[], -- Array of image URLs
  job TEXT,
  location TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

3. Add your credentials to `app.json`:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "your-project-url",
      "supabaseAnonKey": "your-anon-key"
    }
  }
}
```

Or use environment variables (requires additional setup).

### 2. Running the App

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npx expo start

# For Android
npx expo run:android

# For iOS
npx expo run:ios
```

## Usage

1. **Swipe Cards**: Swipe left to pass, right to like
2. **Action Buttons**: Use the buttons at the bottom to pass or like
3. **Card Info**: Each card shows name, age, job, location, and bio
4. **Lazy Loading**: More cards automatically load as you swipe

## Customization

### Card Data Structure

Modify `store/useCardStore.ts` to change the card data format:

```typescript
interface CardData {
  id: string;
  name: string;
  age?: number;
  bio?: string;
  images: string[];
  job?: string;
  location?: string;
}
```

### Styling

All components use NativeWind (Tailwind CSS) classes. Modify classes in:
- `components/swipe-card.tsx` - Card styling
- `app/(tabs)/index.tsx` - Main screen layout
- `components/swipe-actions.tsx` - Action buttons

### Supabase Query

Customize the Supabase query in `components/card-stack.tsx`:

```typescript
const { data, error } = await supabase
  .from('profiles') // Your table name
  .select('*')
  .range(cards.length, cards.length + 10)
  .limit(10);
```

## Key Components

### SwipeCard
- Handles pan gestures
- Animates card rotation and position
- Shows "LIKE" and "NOPE" overlays

### CardStack
- Manages card stack rendering
- Handles lazy loading from Supabase
- Auto-loads more cards when needed

### useCardStore
- Manages card state
- Tracks swiped, liked, and passed cards
- Handles card loading logic

## Technologies

- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Native Reanimated** - Smooth animations
- **React Native Gesture Handler** - Gesture recognition
- **Zustand** - State management
- **NativeWind** - Tailwind CSS for React Native
- **Supabase** - Backend database

## Notes

- The app uses mock data by default until Supabase is configured
- All animations are smooth and performant
- Gesture handling supports both swipe gestures and button taps
- Cards are lazily loaded to optimize performance

