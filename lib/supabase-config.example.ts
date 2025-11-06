/**
 * Supabase Configuration Guide
 * 
 * To connect your app to Supabase:
 * 
 * 1. Create a Supabase project at https://supabase.com
 * 2. Get your project URL and anon key from Settings > API
 * 3. Create a table for user profiles with this schema:
 * 
 *   CREATE TABLE profiles (
 *     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *     name TEXT,
 *     age INTEGER,
 *     bio TEXT,
 *     images TEXT[], -- Array of image URLs
 *     job TEXT,
 *     location TEXT,
 *     created_at TIMESTAMP DEFAULT NOW()
 *   );
 * 
 * 4. Add your credentials to one of these options:
 * 
 * Option A: Add to app.json (expo.extra):
 *   "extra": {
 *     "supabaseUrl": "your-project-url",
 *     "supabaseAnonKey": "your-anon-key"
 *   }
 * 
 * Option B: Create a .env file (requires expo-constants or dotenv):
 *   EXPO_PUBLIC_SUPABASE_URL=your-project-url
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
 * 
 * The app will use mock data if Supabase is not configured.
 */

