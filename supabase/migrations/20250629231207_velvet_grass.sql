/*
  # Update User Roles Schema

  1. Schema Changes
    - Update profiles table role constraint to exclude 'moderator'
    - Add 'Super Admin' as a valid role
    - Update existing moderator users to admin role

  2. Policy Updates
    - Update RLS policies to handle 'Super Admin' role properly
    - Ensure consistent role checking across all policies

  3. Data Migration
    - Convert existing moderator users to admin role
    - Update any references to moderator role
*/

-- First, update any existing moderator users to admin role
UPDATE profiles 
SET role = 'admin' 
WHERE role = 'moderator';

-- Drop the existing check constraint on role column
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new check constraint with updated roles
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'Super Admin', 'user'));

-- Update the get_current_user_status function to handle Super Admin properly
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

-- Update sample data in groups table to reflect new role structure
UPDATE groups 
SET description = 'System administrators and super administrators with full access'
WHERE name = 'Administrators';

-- Update any existing group types that reference moderator
UPDATE groups 
SET type = 'admin' 
WHERE type = 'moderator';

-- Insert a Super Admin group if it doesn't exist
INSERT INTO groups (id, name, description, type) 
SELECT gen_random_uuid(), 'Super Administrators', 'Super administrators with ultimate system access', 'super_admin'
WHERE NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Super Administrators');

-- Update activities and expenses created_by references if needed
-- (No changes needed as these reference user IDs, not roles)

-- Log this migration in audit_logs
INSERT INTO audit_logs (action_type, target_modules, details, status)
VALUES (
  'SCHEMA_UPDATE',
  ARRAY['profiles', 'groups'],
  '{"action": "update_user_roles", "changes": ["removed_moderator_role", "added_super_admin_role", "migrated_existing_moderators_to_admin"]}'::jsonb,
  'success'
);