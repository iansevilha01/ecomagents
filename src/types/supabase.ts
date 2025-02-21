export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          company: string | null;
          website: string | null;
          whatsapp: string | null;
          plan: 'operacional' | 'gerencial' | 'executivo';
          credits_used: number;
          credits_limit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          company?: string;
          website?: string;
          whatsapp?: string;
          plan?: 'operacional' | 'gerencial' | 'executivo';
          credits_used?: number;
          credits_limit?: number;
        };
        Update: {
          email?: string;
          full_name?: string;
          company?: string;
          website?: string;
          whatsapp?: string;
          plan?: 'operacional' | 'gerencial' | 'executivo';
          credits_used?: number;
          credits_limit?: number;
          updated_at?: string;
        };
      };
      // ... rest of the types remain the same
    };
  };
}
