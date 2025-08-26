import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'member' | 'viewer';
          password_hash: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: 'admin' | 'member' | 'viewer';
          password_hash: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Row']>;
      };
      log_entries: {
        Row: {
          id: string;
          activity: string;
          project: string;
          workers: string;
          duration: string | null;
          duration_seconds: number | null;
          upwork_hours: number | null;
          description: string | null;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          activity: string;
          project: string;
          workers: string;
          duration?: string | null;
          duration_seconds?: number | null;
          upwork_hours?: number | null;
          description?: string | null;
          date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['log_entries']['Row']>;
      };
      user_status: {
        Row: {
          id: string;
          user_id: string;
          status: 'active' | 'available-for-work' | 'not-available';
          memo: string | null;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: 'active' | 'available-for-work' | 'not-available';
          memo?: string | null;
          timestamp?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_status']['Row']>;
      };
      active_time_sessions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          start_time: string;
          end_time: string | null;
          duration_seconds: number | null;
          memo: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          start_time: string;
          end_time?: string | null;
          duration_seconds?: number | null;
          memo?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['active_time_sessions']['Row']>;
      };
      morning_checkins: {
        Row: {
          id: string;
          member_name: string;
          project: string;
          task: string;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_name: string;
          project: string;
          task: string;
          timestamp?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['morning_checkins']['Row']>;
      };
    };
  };
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
  db: { schema: 'public' },
});

// handy helpers with proper error surfacing
export async function insertMorningCheckin(payload: Database['public']['Tables']['morning_checkins']['Insert']) {
  const { data, error } = await supabase
    .from('morning_checkins')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function insertLogEntry(payload: Database['public']['Tables']['log_entries']['Insert']) {
  const { data, error } = await supabase.from('log_entries').insert(payload).select().single();
  if (error) throw error;
  return data;
}
