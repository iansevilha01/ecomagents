import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { PLAN_LIMITS, PlanType } from '../types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthState {
  user: Profile | null;
  session: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      set({ 
        user: profile, 
        session: data.session,
        loading: false 
      });
    }
  },
  
  signUp: async (email: string, password: string, fullName: string) => {
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    
    if (signUpError) throw signUpError;
    
    if (user) {
      const defaultPlan: PlanType = 'operacional';
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email,
          full_name: fullName,
          plan: defaultPlan,
          credits_used: 0,
          credits_limit: PLAN_LIMITS[defaultPlan],
        });
      
      if (profileError) throw profileError;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      set({ user: profile, loading: false });
    }
  },
  
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, session: null });
  },
  
  loadUser: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        set({ user: profile, session, loading: false });
      } else {
        set({ user: null, session: null, loading: false });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      set({ loading: false });
    }
  },
}));
