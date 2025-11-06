import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { create } from "zustand";

type AuthState = {
  user: User | null;
  session: Session | null;
  profile: { role?: string; full_name?: string; company_name?: string } | null;
  loading: boolean;
  initialized: boolean;
  login: (user: User, session: Session) => void;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setProfile: (profile: { role?: string; full_name?: string; company_name?: string } | null) => void;
  fetchProfile: (userId: string) => Promise<void>;
  initialize: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  initialized: false,

  login: (user, session) => {
    set({ user, session, loading: false });
    // Fetch profile after login
    get().fetchProfile(user.id);
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null, loading: false });
  },

  setLoading: (loading) => set({ loading }),

  setProfile: (profile) => set({ profile }),

  fetchProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, full_name, company_name')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      set({ profile: data || null });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  },

  initialize: async () => {
    try {
      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        set({ loading: false, initialized: true });
        return;
      }

      if (session?.user) {
        set({ user: session.user, session, loading: false, initialized: true });
        // Fetch profile
        const { fetchProfile } = get();
        await fetchProfile(session.user.id);
      } else {
        set({ user: null, session: null, loading: false, initialized: true });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (session?.user) {
          set({ user: session.user, session });
          // Apply any pending onboarding info saved before user logged in
          try {
            const pendingRaw = await AsyncStorage.getItem('pending_onboarding');
            if (pendingRaw) {
              const pending = JSON.parse(pendingRaw) as { role?: string; full_name?: string | null; company_name?: string | null };
              if (pending?.role) {
                const base = {
                  user_id: session.user.id,
                  role: pending.role,
                  full_name: pending.role === 'job_seeker' ? pending.full_name : null,
                  company_name: pending.role === 'employer' ? pending.company_name : null,
                };
                const { error: upsertError } = await supabase
                  .from('profiles')
                  .upsert(base, { onConflict: 'user_id' });
                if (upsertError) {
                  console.log('Upsert error (profiles):', upsertError);
                } else {
                  console.log('Pending onboarding applied to profiles');
                }
                await AsyncStorage.removeItem('pending_onboarding');
              }
            }
          } catch (e) {
            console.log('Failed applying pending onboarding', e);
          }
          const { fetchProfile } = get();
          await fetchProfile(session.user.id);
        } else {
          set({ user: null, session: null, profile: null });
        }
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ loading: false, initialized: true });
    }
  },
}));
