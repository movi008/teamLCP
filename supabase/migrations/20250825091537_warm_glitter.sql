/*
  # Complete RLS Policy Fix for All Operations

  1. Drop all existing policies
  2. Create comprehensive policies for all tables
  3. Ensure proper permissions for all operations
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can insert status data" ON user_status;
DROP POLICY IF EXISTS "Users can read all status data" ON user_status;
DROP POLICY IF EXISTS "Users can insert active time sessions" ON active_time_sessions;
DROP POLICY IF EXISTS "Users can read all active time sessions" ON active_time_sessions;
DROP POLICY IF EXISTS "Users can update active time sessions" ON active_time_sessions;
DROP POLICY IF EXISTS "Users can delete morning checkins" ON morning_checkins;
DROP POLICY IF EXISTS "Users can insert morning checkins" ON morning_checkins;
DROP POLICY IF EXISTS "Users can read all morning checkins" ON morning_checkins;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Allow initial user setup" ON users;
DROP POLICY IF EXISTS "Allow user authentication" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can delete log entries" ON log_entries;
DROP POLICY IF EXISTS "Users can insert log entries" ON log_entries;
DROP POLICY IF EXISTS "Users can read all log entries" ON log_entries;
DROP POLICY IF EXISTS "Users can update log entries" ON log_entries;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_time_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE morning_checkins ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Allow all operations for authenticated users" ON users
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous read for authentication" ON users
  FOR SELECT TO anon USING (true);

-- Log entries table policies  
CREATE POLICY "Allow all log operations for authenticated users" ON log_entries
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- User status table policies
CREATE POLICY "Allow all status operations for authenticated users" ON user_status
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Active time sessions table policies
CREATE POLICY "Allow all session operations for authenticated users" ON active_time_sessions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Morning checkins table policies
CREATE POLICY "Allow all checkin operations for authenticated users" ON morning_checkins
  FOR ALL TO authenticated USING (true) WITH CHECK (true);