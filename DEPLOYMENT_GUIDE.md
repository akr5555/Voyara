# Production Deployment Checklist

## Database Setup (CRITICAL)

Your production database needs the migration that creates the required tables.

### Run This SQL in Supabase SQL Editor:

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/yrlzcfuubkqdbkwlhjih
2. Navigate to: **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the entire content from: `supabase/migrations/002_check_and_fix.sql`
5. Click **Run**

### What This Creates:

- ✅ `user_profiles` - User profile data
- ✅ `destinations` - Available destinations
- ✅ `trips` - User trip plans
- ✅ `trip_destinations` - Trip itinerary items
- ✅ `saved_destinations` - Saved/favorited places

### Verify Tables Were Created:

1. Go to **Table Editor** in Supabase
2. You should see all 5 tables listed
3. Check that each table has RLS (Row Level Security) enabled

## Common Errors & Solutions

### "Failed to save profile"
**Cause:** `user_profiles` table doesn't exist in production  
**Solution:** Run the migration SQL (see above)

### "Permission denied" 
**Cause:** RLS policies not set up correctly  
**Solution:** The migration creates the policies automatically

### Check Browser Console
Open DevTools (F12) → Console tab to see detailed error logs with these emojis:
- 💾 = Saving profile
- ✅ = Success
- ❌ = Supabase error
- 🚨 = Caught error

## Environment Variables (Render)

Make sure these are set in Render dashboard:

- `VITE_SUPABASE_URL` = https://yrlzcfuubkqdbkwlhjih.supabase.co
- `VITE_SUPABASE_ANON_KEY` = (your anon key from Supabase)

## Testing After Migration

1. **Create an account** on your deployed site
2. **Go to Profile page**
3. **Edit your name** and click Save
4. **Check if header updates** with your new name
5. **Refresh page** - name should persist

If profile save works, all other database features should work too!
