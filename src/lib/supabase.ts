import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  }
});

// Database types
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
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'admin' | 'member' | 'viewer';
          password_hash?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      log_entries: {
        Row: {
          id: string;
          activity: string;
          project: string;
          workers: string;
          duration: string;
          duration_seconds: number;
          upwork_hours: number;
          description: string;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          activity: string;
          project: string;
          workers: string;
          duration?: string;
          duration_seconds?: number;
          upwork_hours?: number;
          description?: string;
          date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          activity?: string;
          project?: string;
          workers?: string;
          duration?: string;
          duration_seconds?: number;
          upwork_hours?: number;
          description?: string;
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
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
        Update: {
          id?: string;
          user_id?: string;
          status?: 'active' | 'available-for-work' | 'not-available';
          memo?: string | null;
          timestamp?: string;
          created_at?: string;
        };
      };
      active_time_sessions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          start_time: string;
          end_time: string | null;
          duration_seconds: number;
          memo: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          start_time: string;
          end_time?: string | null;
          duration_seconds?: number;
          memo?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          start_time?: string;
          end_time?: string | null;
          duration_seconds?: number;
          memo?: string | null;
          created_at?: string;
        };
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
        Update: {
          id?: string;
          member_name?: string;
          project?: string;
          task?: string;
          timestamp?: string;
          created_at?: string;
        };
      };
    };
  };
}