import { supabase } from '../integrations/supabase/client';

// Test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Key exists:', !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Supabase connection error:', error);
      return false;
    }
    
    console.log('✅ Supabase connected successfully!');
    console.log('Session:', data.session ? 'Active' : 'No active session');
    return true;
  } catch (err) {
    console.error('❌ Failed to connect to Supabase:', err);
    return false;
  }
};

// Run test on page load
if (import.meta.env.DEV) {
  testSupabaseConnection();
}
