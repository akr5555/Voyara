import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Use environment variables for Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bxjmcjikzpflkdsrqhwb.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_xV2f3OZqTPeiIIGpD0Mn7g_K-kN2HSf';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL or Key is missing!');
  throw new Error('Missing Supabase credentials');
}

// Create Supabase client for server-side use
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('✅ Supabase client initialized for server');
