
import { createClient } from '@supabase/supabase-js';

// Use default values if environment variables are not set
// These will be replaced with your actual Supabase URL and key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Log warning instead of error to prevent app from crashing during development
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables are not set. Using default values for development.');
  console.warn('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file or project settings.');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
