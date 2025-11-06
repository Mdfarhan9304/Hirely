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
    try {
      await supabase.auth.signOut();
      set({ user: null, session: null, profile: null, loading: false });
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear local state even if signOut fails
      set({ user: null, session: null, profile: null, loading: false });
    }
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
              const pending = JSON.parse(pendingRaw) as { 
                role?: string; 
                full_name?: string | null; 
                company_name?: string | null;
                resume_uri?: string;
                resume_file_name?: string;
                first_name?: string;
                last_name?: string;
                qualification?: string;
                company_size?: string;
                company_description?: string;
              };
              if (pending?.role) {
                const base: any = {
                  user_id: session.user.id,
                  role: pending.role,
                  full_name: pending.role === 'job_seeker' ? pending.full_name : null,
                  company_name: pending.role === 'employer' ? pending.company_name : null,
                };
                
                // Add job seeker specific fields
                if (pending.role === 'job_seeker') {
                  if (pending.first_name) base.first_name = pending.first_name;
                  if (pending.last_name) base.last_name = pending.last_name;
                  if (pending.qualification) base.qualification = pending.qualification;
                  
                  // Upload resume if it's a local file
                  if (pending.resume_uri) {
                    let finalResumeUri = pending.resume_uri;
                    if (pending.resume_uri.startsWith('file://')) {
                      try {
                        const FileSystem = await import('expo-file-system/legacy');
                        const base64 = await FileSystem.readAsStringAsync(pending.resume_uri, {
                          encoding: 'base64',
                        });
                        
                        // Convert base64 to ArrayBuffer
                        const byteCharacters = atob(base64);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                          byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        
                        const timestamp = Date.now();
                        const fileExtension = pending.resume_file_name?.split('.').pop() || 'pdf';
                        const fileName = `${timestamp}.${fileExtension}`;
                        const filePath = `${session.user.id}/${fileName}`;
                        
                        const { error: uploadError } = await supabase.storage
                          .from('resumes')
                          .upload(filePath, byteArray, {
                            contentType: 'application/pdf',
                            upsert: false,
                          });
                        
                        if (!uploadError) {
                          const { data: urlData } = supabase.storage
                            .from('resumes')
                            .getPublicUrl(filePath);
                          finalResumeUri = urlData.publicUrl;
                        }
                      } catch (uploadErr) {
                        console.log('Error uploading pending resume:', uploadErr);
                      }
                    }
                    base.resume_uri = finalResumeUri;
                    if (pending.resume_file_name) base.resume_file_name = pending.resume_file_name;
                  }
                }
                
                // Add employer specific fields
                if (pending.role === 'employer') {
                  if (pending.company_size) base.company_size = pending.company_size;
                  if (pending.company_description) base.company_description = pending.company_description;
                }
                
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
