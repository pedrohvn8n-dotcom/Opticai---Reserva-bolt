import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Profile {
  user_id: string;
  tenant_id: string;
  role: 'owner' | 'admin' | 'staff';
  created_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  logo_url: string | null;
  endereco: string | null;
  numero: string | null;
  created_at: string;
}