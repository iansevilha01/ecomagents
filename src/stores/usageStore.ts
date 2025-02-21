import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type UsageHistory = Database['public']['Tables']['usage_history']['Row'];

interface UsageState {
  history: UsageHistory[];
  loading: boolean;
  loadHistory: (userId: string) => Promise<void>;
  recordUsage: (usage: Omit<UsageHistory, 'id' | 'created_at'>) => Promise<void>;
  checkCredits: (userId: string) => Promise<boolean>;
}

export const useUsageStore = create<UsageState>((set, get) => ({
  history: [],
  loading: false,
  
  loadHistory: async (userId: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('usage_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      set({ history: data || [], loading: false });
    } catch (error) {
      console.error('Error loading history:', error);
      set({ loading: false });
    }
  },
  
  recordUsage: async (usage) => {
    try {
      const { error } = await supabase
        .from('usage_history')
        .insert(usage);
        
      if (error) throw error;
      
      // Update credits used
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          credits_used: supabase.rpc('increment_credits', { amount: usage.tokens_used })
        })
        .eq('id', usage.user_id);
        
      if (updateError) throw updateError;
      
      // Reload history
      await get().loadHistory(usage.user_id);
    } catch (error) {
      console.error('Error recording usage:', error);
    }
  },
  
  checkCredits: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits_used, credits_limit')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      return data.credits_used < data.credits_limit;
    } catch (error) {
      console.error('Error checking credits:', error);
      return false;
    }
  },
}));
