/*
  # Ensure proper RLS policies for all operations

  1. Users table policies
    - Allow admins to manage all users
    - Allow users to read their own data
    - Allow initial user setup

  2. Log entries policies
    - Allow authenticated users to manage logs
    - Proper CRUD operations

  3. Status and session policies
    - Allow authenticated users to manage their data
    - Allow admins to view all data

  4. Morning checkins policies
    - Allow authenticated users to manage checkins
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Allow initial user setup" ON users;
DROP POLICY IF EXISTS "Allow user authentication" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Users table policies
CREATE POLICY "Allow initial user setup" ON users
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow user authentication" ON users
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin_user 
      WHERE admin_user.id::text = auth.uid()::text 
      AND admin_user.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users admin_user 
      WHERE admin_user.id::text = auth.uid()::text 
      AND admin_user.role = 'admin'
    )
  );

-- Ensure log_entries policies exist
DROP POLICY IF EXISTS "Users can read all log entries" ON log_entries;
DROP POLICY IF EXISTS "Users can insert log entries" ON log_entries;
DROP POLICY IF EXISTS "Users can update log entries" ON log_entries;
DROP POLICY IF EXISTS "Users can delete log entries" ON log_entries;

CREATE POLICY "Users can read all log entries" ON log_entries
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert log entries" ON log_entries
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update log entries" ON log_entries
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete log entries" ON log_entries
  FOR DELETE TO authenticated
  USING (true);

-- Ensure user_status policies exist
DROP POLICY IF EXISTS "Users can read all status data" ON user_status;
DROP POLICY IF EXISTS "Users can insert status data" ON user_status;

CREATE POLICY "Users can read all status data" ON user_status
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert status data" ON user_status
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Ensure active_time_sessions policies exist
DROP POLICY IF EXISTS "Users can read all active time sessions" ON active_time_sessions;
DROP POLICY IF EXISTS "Users can insert active time sessions" ON active_time_sessions;
DROP POLICY IF EXISTS "Users can update active time sessions" ON active_time_sessions;

CREATE POLICY "Users can read all active time sessions" ON active_time_sessions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert active time sessions" ON active_time_sessions
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update active time sessions" ON active_time_sessions
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure morning_checkins policies exist
DROP POLICY IF EXISTS "Users can read all morning checkins" ON morning_checkins;
DROP POLICY IF EXISTS "Users can insert morning checkins" ON morning_checkins;
DROP POLICY IF EXISTS "Users can delete morning checkins" ON morning_checkins;

CREATE POLICY "Users can read all morning checkins" ON morning_checkins
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert morning checkins" ON morning_checkins
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete morning checkins" ON morning_checkins
  FOR DELETE TO authenticated
  USING (true);