# Supabase Setup Instructions

This document contains the SQL commands needed to set up your Supabase database for the authentication system.

## Database Schema

### 1. Add username column to profiles table

Run this SQL in your Supabase SQL Editor:

```sql
-- Add username column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
```

### 2. Row Level Security (RLS) Policies

Make sure you have proper RLS policies set up:

```sql
-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all profiles (for user management)
CREATE POLICY "Allow authenticated users to read profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy: Admins can update any profile (for role management)
CREATE POLICY "Admins can update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 0
  )
);

-- Policy: Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 0
  )
);
```

### 3. Existing Database Structure

Make sure you already have these tables created (from the original plan):

```sql
-- Roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id INTEGER PRIMARY KEY,
  description TEXT
);

INSERT INTO public.roles (id, description) VALUES
  (0, 'Administrator'),
  (1, 'Staff')
ON CONFLICT (id) DO NOTHING;

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role INTEGER REFERENCES public.roles(id),
  username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Authentication Configuration

### Disable Email Confirmation

Since this is an internal app without email verification:

1. Go to **Authentication > Settings** in your Supabase dashboard
2. Under **Email Auth**, disable "Confirm email"
3. Under **Auth Providers**, make sure "Email" is enabled

### Email Templates (Optional)

You can customize the email templates if needed, but for an internal app, you might want to disable email sending entirely.

## Notes

- The username is stored in the `profiles` table for easy access
- Usernames are converted to email format: `username@snackisland.com`
- Role 0 = Administrator (full access)
- Role 1 = Staff (limited to Orders page only)
- The default role on signup is currently set to Administrator (0) for initial setup
- After creating your admin account, change the default role to Staff (1) in `src/services/authService.ts`

