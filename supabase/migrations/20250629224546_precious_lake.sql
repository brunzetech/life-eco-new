/*
  # Complete Life Economy Database Schema

  1. New Tables
    - `profiles` - User profiles with roles and balances
    - `groups` - User groups for organization
    - `transactions` - Financial transaction records
    - `marketplace_items` - Items available for purchase
    - `purchase_records` - Purchase history
    - `activities` - Reward activities
    - `expenses` - System expenses
    - `audit_logs` - System audit trail

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for role-based access
    - Create indexes for performance

  3. Sample Data
    - Default groups (admin, moderator, premium, standard)
    - Sample activities and expenses
    - Sample marketplace items
*/

-- Drop existing policies if they exist to avoid conflicts
DO $$ 
BEGIN
  -- Drop policies for groups table
  DROP POLICY IF EXISTS "Admins can manage groups" ON groups;
  DROP POLICY IF EXISTS "Users can read groups" ON groups;
  DROP POLICY IF EXISTS "Authenticated users can read groups" ON groups;
  
  -- Drop policies for profiles table
  DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
  DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
  DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Admins and Super Admins can read all profiles" ON profiles;
  DROP POLICY IF EXISTS "Admins and Super Admins can update all profiles" ON profiles;
  DROP POLICY IF EXISTS "Super Admins can delete any profile" ON profiles;
  DROP POLICY IF EXISTS "Super Admins can insert any profile" ON profiles;
  DROP POLICY IF EXISTS "Users can read their own profile unless suspended" ON profiles;
  DROP POLICY IF EXISTS "Users can update their own profile unless suspended" ON profiles;
  
  -- Drop policies for transactions table
  DROP POLICY IF EXISTS "Users can read own transactions" ON transactions;
  DROP POLICY IF EXISTS "Admins can read all transactions" ON transactions;
  DROP POLICY IF EXISTS "Admins can manage transactions" ON transactions;
  DROP POLICY IF EXISTS "Admins can manage all transactions" ON transactions;
  DROP POLICY IF EXISTS "Authenticated users can insert their own transactions" ON transactions;
  DROP POLICY IF EXISTS "Authenticated users can read their own transactions" ON transactions;
  
  -- Drop policies for marketplace_items table
  DROP POLICY IF EXISTS "Users can read active marketplace items" ON marketplace_items;
  DROP POLICY IF EXISTS "Admins can manage marketplace items" ON marketplace_items;
  DROP POLICY IF EXISTS "All authenticated users can read marketplace items" ON marketplace_items;
  
  -- Drop policies for purchase_records table
  DROP POLICY IF EXISTS "Users can read own purchases" ON purchase_records;
  DROP POLICY IF EXISTS "Admins can read all purchases" ON purchase_records;
  DROP POLICY IF EXISTS "Admins can manage all purchase records" ON purchase_records;
  DROP POLICY IF EXISTS "Authenticated users can insert their own purchase records" ON purchase_records;
  DROP POLICY IF EXISTS "Authenticated users can read their own purchase records" ON purchase_records;
  
  -- Drop policies for activities table
  DROP POLICY IF EXISTS "Users can read activities" ON activities;
  DROP POLICY IF EXISTS "Admins can manage activities" ON activities;
  DROP POLICY IF EXISTS "All authenticated users can read activities" ON activities;
  
  -- Drop policies for expenses table
  DROP POLICY IF EXISTS "Admins can manage expenses" ON expenses;
  DROP POLICY IF EXISTS "All authenticated users can read expenses" ON expenses;
  
  -- Drop policies for audit_logs table
  DROP POLICY IF EXISTS "Admins can read audit logs" ON audit_logs;
  DROP POLICY IF EXISTS "Super Admins can manage audit logs" ON audit_logs;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignore errors if policies don't exist
    NULL;
END $$;

-- Create function to get current user status (if not exists)
CREATE OR REPLACE FUNCTION get_current_user_status()
RETURNS TABLE(user_id uuid, user_role text, is_suspended boolean)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id, role, is_suspended 
  FROM profiles 
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  display_name text,
  bio text,
  avatar_url text,
  balance numeric DEFAULT 0,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user')),
  group_id uuid,
  is_suspended boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('credit', 'debit', 'transfer', 'purchase', 'reward', 'penalty')),
  narration text,
  description text,
  debit numeric DEFAULT 0,
  credit numeric DEFAULT 0,
  balance_after numeric NOT NULL,
  sender_id uuid REFERENCES profiles(id),
  receiver_id uuid REFERENCES profiles(id),
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Create marketplace_items table
CREATE TABLE IF NOT EXISTS marketplace_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  image_url text,
  category text DEFAULT 'general',
  stock integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  deleted boolean DEFAULT false,
  deleted_at timestamptz,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create purchase_records table
CREATE TABLE IF NOT EXISTS purchase_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES marketplace_items(id),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  price_per_item_snapshot numeric NOT NULL,
  item_name_snapshot text NOT NULL,
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  purchase_date timestamptz DEFAULT now(),
  delivery_date timestamptz
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  pay numeric NOT NULL DEFAULT 0 CHECK (pay >= 0),
  frequency text DEFAULT 'once' CHECK (frequency IN ('once', 'daily', 'weekly', 'monthly')),
  slots_available integer,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  cost numeric NOT NULL DEFAULT 0 CHECK (cost >= 0),
  frequency text DEFAULT 'once' CHECK (frequency IN ('once', 'daily', 'weekly', 'monthly')),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  target_modules text[] DEFAULT '{}',
  file_name text,
  performed_by uuid REFERENCES profiles(id),
  timestamp timestamptz DEFAULT now(),
  status text DEFAULT 'success' CHECK (status IN ('success', 'failed', 'pending')),
  details jsonb DEFAULT '{}'
);

-- Add foreign key constraint for group_id in profiles (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_profiles_group_id' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT fk_profiles_group_id 
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read their own profile unless suspended"
  ON profiles
  FOR SELECT
  TO authenticated
  USING ((auth.uid() = id) AND (NOT is_suspended));

CREATE POLICY "Users can update their own profile unless suspended"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING ((auth.uid() = id) AND (NOT is_suspended));

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

CREATE POLICY "Super Admins can delete any profile"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    (( SELECT get_current_user_status.user_role
       FROM get_current_user_status() get_current_user_status(user_id, user_role, is_suspended)
      WHERE (get_current_user_status.user_id = auth.uid())) = 'Super Admin'::text) 
    AND (NOT ( SELECT get_current_user_status.is_suspended
               FROM get_current_user_status() get_current_user_status(user_id, user_role, is_suspended)
              WHERE (get_current_user_status.user_id = auth.uid())))
  );

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

-- Create policies for groups
CREATE POLICY "Authenticated users can read groups"
  ON groups
  FOR SELECT
  TO authenticated
  USING (true);

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

-- Create policies for transactions
CREATE POLICY "Authenticated users can read their own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING ((auth.uid() = user_id) OR (auth.uid() = sender_id) OR (auth.uid() = receiver_id));

CREATE POLICY "Authenticated users can insert their own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.uid() = user_id) OR (auth.uid() = sender_id) OR (auth.uid() = receiver_id));

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

-- Create policies for marketplace_items
CREATE POLICY "All authenticated users can read marketplace items"
  ON marketplace_items
  FOR SELECT
  TO authenticated
  USING (true);

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

-- Create policies for purchase_records
CREATE POLICY "Authenticated users can read their own purchase records"
  ON purchase_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own purchase records"
  ON purchase_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

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

-- Create policies for activities
CREATE POLICY "All authenticated users can read activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (true);

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

-- Create policies for expenses
CREATE POLICY "All authenticated users can read expenses"
  ON expenses
  FOR SELECT
  TO authenticated
  USING (true);

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

-- Create policies for audit_logs
CREATE POLICY "Admins can read audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    ( SELECT get_current_user_status.user_role
      FROM get_current_user_status() get_current_user_status(user_id, user_role, is_suspended)
     WHERE (get_current_user_status.user_id = auth.uid())) = 'admin'::text
  );

CREATE POLICY "Super Admins can manage audit logs"
  ON audit_logs
  FOR ALL
  TO authenticated
  USING (
    ( SELECT get_current_user_status.user_role
      FROM get_current_user_status() get_current_user_status(user_id, user_role, is_suspended)
     WHERE (get_current_user_status.user_id = auth.uid())) = 'Super Admin'::text
  )
  WITH CHECK (
    ( SELECT get_current_user_status.user_role
      FROM get_current_user_status() get_current_user_status(user_id, user_role, is_suspended)
     WHERE (get_current_user_status.user_id = auth.uid())) = 'Super Admin'::text
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_group_id ON profiles(group_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_status ON marketplace_items(status);
CREATE INDEX IF NOT EXISTS idx_purchase_records_user_id ON purchase_records(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- Insert sample data (only if not exists)
INSERT INTO groups (id, name, description, type) 
SELECT gen_random_uuid(), 'Administrators', 'System administrators with full access', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Administrators');

INSERT INTO groups (id, name, description, type) 
SELECT gen_random_uuid(), 'Moderators', 'Content moderators and community managers', 'moderator'
WHERE NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Moderators');

INSERT INTO groups (id, name, description, type) 
SELECT gen_random_uuid(), 'Premium Users', 'Users with premium access', 'premium'
WHERE NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Premium Users');

INSERT INTO groups (id, name, description, type) 
SELECT gen_random_uuid(), 'Regular Users', 'Standard user group', 'standard'
WHERE NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Regular Users');

-- Insert sample activities
INSERT INTO activities (name, description, pay, frequency) 
SELECT 'Daily Check-in', 'Check in daily to earn rewards', 10, 'daily'
WHERE NOT EXISTS (SELECT 1 FROM activities WHERE name = 'Daily Check-in');

INSERT INTO activities (name, description, pay, frequency) 
SELECT 'Weekly Survey', 'Complete weekly community survey', 50, 'weekly'
WHERE NOT EXISTS (SELECT 1 FROM activities WHERE name = 'Weekly Survey');

INSERT INTO activities (name, description, pay, frequency) 
SELECT 'Content Creation', 'Create and share content', 100, 'once'
WHERE NOT EXISTS (SELECT 1 FROM activities WHERE name = 'Content Creation');

INSERT INTO activities (name, description, pay, frequency) 
SELECT 'Community Engagement', 'Participate in community discussions', 25, 'daily'
WHERE NOT EXISTS (SELECT 1 FROM activities WHERE name = 'Community Engagement');

INSERT INTO activities (name, description, pay, frequency) 
SELECT 'Referral Bonus', 'Refer new users to the platform', 200, 'once'
WHERE NOT EXISTS (SELECT 1 FROM activities WHERE name = 'Referral Bonus');

-- Insert sample expenses
INSERT INTO expenses (name, description, cost, frequency) 
SELECT 'Server Hosting', 'Monthly server hosting costs', 500, 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM expenses WHERE name = 'Server Hosting');

INSERT INTO expenses (name, description, cost, frequency) 
SELECT 'Content Moderation', 'Weekly content moderation costs', 200, 'weekly'
WHERE NOT EXISTS (SELECT 1 FROM expenses WHERE name = 'Content Moderation');

INSERT INTO expenses (name, description, cost, frequency) 
SELECT 'Marketing Campaign', 'One-time marketing campaign', 1000, 'once'
WHERE NOT EXISTS (SELECT 1 FROM expenses WHERE name = 'Marketing Campaign');

INSERT INTO expenses (name, description, cost, frequency) 
SELECT 'Support Staff', 'Monthly support staff costs', 2000, 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM expenses WHERE name = 'Support Staff');

-- Insert sample marketplace items
INSERT INTO marketplace_items (name, description, price, category, stock, status) 
SELECT 'Premium Badge', 'Show your premium status with a special badge', 100, 'badges', 999, 'active'
WHERE NOT EXISTS (SELECT 1 FROM marketplace_items WHERE name = 'Premium Badge');

INSERT INTO marketplace_items (name, description, price, category, stock, status) 
SELECT 'Custom Avatar Frame', 'Personalize your avatar with a custom frame', 50, 'cosmetics', 999, 'active'
WHERE NOT EXISTS (SELECT 1 FROM marketplace_items WHERE name = 'Custom Avatar Frame');

INSERT INTO marketplace_items (name, description, price, category, stock, status) 
SELECT 'Extra Storage', 'Get additional storage space for your content', 200, 'utilities', 100, 'active'
WHERE NOT EXISTS (SELECT 1 FROM marketplace_items WHERE name = 'Extra Storage');

INSERT INTO marketplace_items (name, description, price, category, stock, status) 
SELECT 'Priority Support', 'Get priority customer support for 30 days', 150, 'services', 50, 'active'
WHERE NOT EXISTS (SELECT 1 FROM marketplace_items WHERE name = 'Priority Support');

INSERT INTO marketplace_items (name, description, price, category, stock, status) 
SELECT 'Community Spotlight', 'Feature your profile in the community spotlight', 300, 'promotion', 10, 'active'
WHERE NOT EXISTS (SELECT 1 FROM marketplace_items WHERE name = 'Community Spotlight');