# Database Setup Instructions

## 🚨 IMPORTANT: Run This Migration First! 🚨

You're getting a "Failed to save profile" error because the database tables don't exist yet.

## Steps to Fix:

### 1. Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/yrlzcfuubkqdbkwlhjih

### 2. Navigate to SQL Editor
- Click **"SQL Editor"** in the left sidebar
- Click **"New Query"** button

### 3. Copy the Migration File
- Open the file: `supabase/migrations/001_complete_schema.sql`
- Copy ALL the contents (245 lines)

### 4. Run the Migration
- Paste the SQL into the Supabase SQL Editor
- Click **"Run"** button (or press Ctrl+Enter)
- Wait for "Success" message

### 5. Verify Tables Created
- Click **"Table Editor"** in the left sidebar
- You should see these tables:
  - ✅ `destinations`
  - ✅ `user_profiles`
  - ✅ `trips`
  - ✅ `trip_destinations`
  - ✅ `saved_destinations`

### 6. Test the Profile Page
- Go back to your app
- Try saving your profile again
- It should work now! ✨

## What the Migration Creates:

1. **user_profiles** - Stores user profile data (name, bio, avatar, language)
2. **trips** - Stores all your trips
3. **destinations** - Global destinations database (pre-populated with 10 destinations)
4. **trip_destinations** - Links trips to destinations
5. **saved_destinations** - User's saved/favorite destinations
6. **RLS Policies** - Secure row-level security
7. **Triggers** - Auto-update timestamps

## Common Issues:

### "Permission Denied"
- Make sure you're logged into the correct Supabase account
- Verify project ID: `yrlzcfuubkqdbkwlhjih`

### "Relation Already Exists"
- Tables are already created! The app should work.
- Try saving your profile again.

### Still Getting Errors?
- Check the browser console (F12)
- Look for detailed error messages
- The error toast will now show helpful messages

---

**After running the migration, refresh your app and try saving your profile!**
