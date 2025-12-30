import { createClient } from '@supabase/supabase-js';

// Use environment variables for Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yrlzcfuubkqdbkwlhjih.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlybHpjZnV1YmtxZGJrd2xoamloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTM4NTMsImV4cCI6MjA4MjQ4OTg1M30.8pNCxyrLUN97EK6wH8HfGCK37l-OBB48Q3Chevqxo7M';

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
