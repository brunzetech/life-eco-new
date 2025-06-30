/*
  # User Profile Synchronization

  1. Functions
    - `create_profile_on_user_insert()` - Automatically creates profiles for new auth users
    - `sync_existing_users()` - Manually syncs existing auth users to profiles table
    - `get_user_profile()` - Retrieves user profile with auth data

  2. Triggers
    - Auto-create profile trigger on auth.users insert

  3. Security
    - Proper foreign key relationships
    - RLS policies maintained
    - Error handling for edge cases

  4. Permissions
    - Grant necessary permissions for authenticated users
*/

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION create_profile_on_user_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    balance,
    is_suspended,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    'user',
    0,
    false,
    NEW.created_at
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, do nothing
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger to automatically create profiles for new users
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
CREATE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_on_user_insert();

-- Function to manually sync existing users from auth.users to profiles
CREATE OR REPLACE FUNCTION sync_existing_users()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  synced_count INTEGER := 0;
BEGIN
  -- Loop through all users in auth.users that don't have profiles
  FOR user_record IN 
    SELECT au.id, au.email, au.created_at, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
  LOOP
    BEGIN
      INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        balance,
        is_suspended,
        created_at
      )
      VALUES (
        user_record.id,
        user_record.email,
        COALESCE(
          user_record.raw_user_meta_data->>'full_name', 
          user_record.raw_user_meta_data->>'name'
        ),
        'user',
        0,
        false,
        user_record.created_at
      );
      
      synced_count := synced_count + 1;
      
    EXCEPTION
      WHEN unique_violation THEN
        -- Profile already exists, skip
        CONTINUE;
      WHEN OTHERS THEN
        -- Log error but continue with other users
        RAISE WARNING 'Failed to sync user %: %', user_record.id, SQLERRM;
        CONTINUE;
    END;
  END LOOP;
  
  RETURN synced_count;
END;
$$;

-- Update the profiles table to ensure proper foreign key relationship
DO $$
BEGIN
  -- Add foreign key constraint to link profiles.id with auth.users.id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Constraint might already exist with different name, ignore error
    NULL;
END $$;

-- Function to get user profile with auth data
CREATE OR REPLACE FUNCTION get_user_profile(user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  display_name text,
  bio text,
  avatar_url text,
  balance numeric,
  role text,
  group_id uuid,
  is_suspended boolean,
  created_at timestamptz,
  auth_email text,
  auth_confirmed_at timestamptz,
  auth_last_sign_in_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.display_name,
    p.bio,
    p.avatar_url,
    p.balance,
    p.role,
    p.group_id,
    p.is_suspended,
    p.created_at,
    au.email as auth_email,
    au.confirmed_at as auth_confirmed_at,
    au.last_sign_in_at as auth_last_sign_in_at
  FROM public.profiles p
  LEFT JOIN auth.users au ON p.id = au.id
  WHERE p.id = user_id;
$$;

-- Function to get current user status (used in RLS policies)
CREATE OR REPLACE FUNCTION get_current_user_status()
RETURNS TABLE(
  user_id uuid,
  user_role text,
  is_suspended boolean
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.id as user_id,
    p.role as user_role,
    p.is_suspended
  FROM public.profiles p
  WHERE p.id = auth.uid();
$$;

-- Execute the sync function to sync existing users
SELECT sync_existing_users() as synced_users_count;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT EXECUTE ON FUNCTION create_profile_on_user_insert() TO authenticated;
GRANT EXECUTE ON FUNCTION sync_existing_users() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_status() TO authenticated;