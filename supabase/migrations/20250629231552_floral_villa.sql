/*
  # Update User Roles Schema

  1. Role Updates
    - Remove 'moderator' role from system
    - Add 'Super Admin' as valid role
    - Migrate existing moderator users to admin
    - Update constraints and functions

  2. Group Updates
    - Add Super Administrators group
    - Update existing group types
    - Clean up moderator references

  3. Security
    - Update RLS policies to handle new roles
    - Maintain data integrity during migration
*/

-- First, let's see what roles currently exist and update them
DO $$
BEGIN
  -- Update any existing moderator users to admin role
  UPDATE profiles 
  SET role = 'admin' 
  WHERE role = 'moderator';
  
  -- Update any other invalid roles to 'user'
  UPDATE profiles 
  SET role = 'user' 
  WHERE role NOT IN ('admin', 'user', 'Super Admin');
  
  RAISE NOTICE 'Updated user roles successfully';
END $$;

-- Now safely drop and recreate the constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new check constraint with updated roles (after data is clean)
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

-- Update existing RLS policies to handle Super Admin role properly
-- Drop and recreate policies that reference role checks

-- Update profiles policies
DROP POLICY IF EXISTS "Admins and Super Admins can read all profiles" ON profiles;
CREATE POLICY "Admins and Super Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    (( SELECT get_current_user_status.user_role
       FROM get_current_user_status() get_current_user_status(user_id, user_role, is_suspended)
      WHERE (get_current_user_status.user_id = auth.uid())) = ANY (ARRAY['admin'::text, 'Super Admin'::text])) 
    AND (NOT ( SELECT get_current_user_status.is_suspended
               FROM get_current_user_status() get_current_user_status(user_id, user_role, is_suspended)
              WHERE (get_current_user_status.user_id = auth.uid())))
  );

DROP POLICY IF EXISTS "Admins and Super Admins can update all profiles" ON profiles;
CREATE POLICY "Admins and Super Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    (( SELECT get_current_user_status.user_role
       FROM get_current_user_status() get_current_user_status(user_id, user_role, is_suspended)
      WHERE (get_current_user_status.user_id = auth.uid())) = ANY (ARRAY['admin'::text, 'Super Admin'::text])) 
    AND (NOT ( SELECT get_current_user_status.is_suspended
               FROM get_current_user_status() get_current_user_status(user_id, user_role, is_suspended)
              WHERE (get_current_user_status.user_id = auth.uid())))
  );

DROP POLICY IF EXISTS "Super Admins can insert any profile" ON profiles;
CREATE POLICY "Super Admins can insert any profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (( SELECT get_current_user_status.user_role
       FROM get_current_user_status() get_current_user_status(user_id, user_role, is_suspended)
      WHERE (get_current_user_status.user_id = auth.uid())) = ANY (ARRAY['admin'::text, 'Super Admin'::text])) 
    AND (NOT ( SELECT get_current_user_status.is_suspended
               FROM get_current_user_status() get_current_user_status(user_id, user_role, is_suspended)
              WHERE (get_current_user_status.user_id = auth.uid())))
  );

-- Update groups policies
DROP POLICY IF EXISTS "Admins can manage groups" ON groups;
CREATE POLICY "Admins can manage groups"
  ON groups
  FOR ALL
  TO authenticated
  USING (
    ( SELECT get_current_user_status.user_role
      FROM get_current_user_status() get_current_user_status(user_id, user_role, is_suspended)
     WHERE (get_current_user_status.user_id = auth.uid())) = ANY (ARRAY['admin'::text, 'Super Admin'::text])
  )
  WITH CHECK (
    ( SELECT get_current_user_status.user_role
      FROM get_current_user_status() get_current_user_status(user_id, user_role, is_suspended)
     WHERE (get_current_user_status.user_id = auth.uid())) = ANY (ARRAY['admin'::text, 'Super Admin'::text])
  );

-- Update transactions policies
DROP POLICY IF EXISTS "Admins can manage all transactions" ON transactions;
CREATE POLICY "Admins can manage all transactions"
  ON transactions
  FOR ALL
  TO authenticated
  USING (
    ( SELECT get_current_user_status.user_role
      FROM get_current_user_status() get_current_user_status(user_id, user_role, is_suspended)
     WHERE (get_current_user_status.user_id = auth.uid())) = ANY (ARRAY['admin'::text, 'Super Admin'::text])
  )
  WITH CHECK (
    ( SELECT get_current_user_status.user_role
      FROM get_current_user_status() get_current_user_status(user_id, user_role, is_suspended)
     WHERE (get_current_user_status.user_id = auth.uid())) = ANY (ARRAY['admin'::text, 'Super Admin'::text])
  );

-- Update marketplace_items policies
DROP POLICY IF EXISTS "Admins can manage marketplace items" ON marketplace_items;
CREATE POLICY "Admins can manage marketplace items"
  ON marketplace_items
  FOR ALL
  TO authenticated
  USING (
    ( SELECT get_current_user_status.user_role
      FROM get_current_user_status() get_current_user_status(user_id, user_role, is_suspended)
     WHERE (get_current_user_status.user_id = auth.uid())) = ANY (ARRAY['admin'::text, 'Super Admin'::text])
  )
  WITH CHECK (
    ( SELECT get_current_user_status.user_role
      FROM get_current_user_status() get_current_user_status(user_id, user_role, is_suspended)
     WHERE (get_current_user_status.user_id = auth.uid())) = ANY (ARRAY['admin'::text, 'Super Admin'::text])
  );

-- Update purchase_records policies
DROP POLICY IF EXISTS "Admins can manage all purchase records" ON purchase_records;
CREATE POLICY "Admins can manage all purchase records"
  ON purchase_records
  FOR ALL
  TO authenticated
  USING (
    ( SELECT get_current_user_status.user_role
      FROM get_current_user_status() get_current_user_status(user_id, user_role, is_suspended)
     WHERE (get_current_user_status.user_id = auth.uid())) = ANY (ARRAY['admin'::text, 'Super Admin'::text])
  )
  WITH CHECK (
    ( SELECT get_current_user_status.user_role
      FROM get_current_user_status() get_current_user_status(user_id, user_role, is_suspended)
     WHERE (get_current_user_status.user_id = auth.uid())) = ANY (ARRAY['admin'::text, 'Super Admin'::text])
  );

-- Update activities policies
DROP POLICY IF EXISTS "Admins can manage activities" ON activities;
CREATE POLICY "Admins can manage activities"
  ON activities
  FOR ALL
  TO authenticated
  USING (
    ( SELECT get_current_user_status.user_role
      FROM get_current_user_status() get_current_user_status(user_id, user_role, is_suspended)
     WHERE (get_current_user_status.user_id = auth.uid())) = ANY (ARRAY['admin'::text, 'Super Admin'::text])
  )
  WITH CHECK (
    ( SELECT get_current_user_status.user_role
      FROM get_current_user_status() get_current_user_status(user_id, user_role, is_suspended)
     WHERE (get_current_user_status.user_id = auth.uid())) = ANY (ARRAY['admin'::text, 'Super Admin'::text])
  );

-- Update expenses policies
DROP POLICY IF EXISTS "Admins can manage expenses" ON expenses;
CREATE POLICY "Admins can manage expenses"
  ON expenses
  FOR ALL
  TO authenticated
  USING (
    ( SELECT get_current_user_status.user_role
      FROM get_current_user_status() get_current_user_status(user_id, user_role, is_suspended)
     WHERE (get_current_user_status.user_id = auth.uid())) = ANY (ARRAY['admin'::text, 'Super Admin'::text])
  )
  WITH CHECK (
    ( SELECT get_current_user_status.user_role
      FROM get_current_user_status() get_current_user_status(user_id, user_role, is_suspended)
     WHERE (get_current_user_status.user_id = auth.uid())) = ANY (ARRAY['admin'::text, 'Super Admin'::text])
  );

-- Update audit_logs policies
DROP POLICY IF EXISTS "Admins can read audit logs" ON audit_logs;
CREATE POLICY "Admins can read audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    ( SELECT get_current_user_status.user_role
      FROM get_current_user_status() get_current_user_status(user_id, user_role, is_suspended)
     WHERE (get_current_user_status.user_id = auth.uid())) = ANY (ARRAY['admin'::text, 'Super Admin'::text])
  );

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

-- Remove the old Moderators group if it exists
DELETE FROM groups WHERE name = 'Moderators' AND type = 'moderator';

-- Log this migration in audit_logs
INSERT INTO audit_logs (action_type, target_modules, details, status)
VALUES (
  'SCHEMA_UPDATE',
  ARRAY['profiles', 'groups'],
  '{"action": "update_user_roles", "changes": ["removed_moderator_role", "added_super_admin_role", "migrated_existing_moderators_to_admin", "updated_rls_policies"]}'::jsonb,
  'success'
);