import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import 'react-native-url-polyfill/auto';

WebBrowser.maybeCompleteAuthSession();

// MCP configured Supabase credentials
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://jxmwttdzzmqiezydiias.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4bXd0dGR6em1xaWV6eWRpaWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjk1MzksImV4cCI6MjA3NjcwNTUzOX0.dMB6vcBf_QwEkuUaA2Qge13QE6EGmMyYUTOrGQuf-QE';

// Initialize Supabase client immediately to ensure session persistence
// Use a single instance to avoid session sync issues
function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL and key not configured. Using mock client.');
    return createClient('https://placeholder.supabase.co', 'placeholder-key');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storageKey: 'supabase.auth.token',
    },
  });
}

// Create client immediately to ensure session is persisted
const supabaseClient = createSupabaseClient();

export const getSupabaseClient = () => {
  return supabaseClient;
};

export const supabase = supabaseClient;
export default supabase;

