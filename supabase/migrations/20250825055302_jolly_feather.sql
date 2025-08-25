/*
  # Create database schema for team management system

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `role` (text)
      - `password_hash` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `log_entries`
      - `id` (uuid, primary key)
      - `activity` (text)
      - `project` (text)
      - `workers` (text)
      - `duration` (text)
      - `duration_seconds` (integer)
      - `upwork_hours` (numeric)
      - `description` (text)
      - `date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_status`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `status` (text)
      - `memo` (text)
      - `timestamp` (timestamp)
      - `created_at` (timestamp)
    
    - `active_time_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `date` (date)
      - `start_time` (timestamp)
      - `end_time` (timestamp)
      - `duration_seconds` (integer)
      - `memo` (text)
      - `created_at` (timestamp)
    
    - `morning_checkins`
      - `id` (uuid, primary key)
      - `member_name` (text)
      - `project` (text)
      - `task` (text)
      - `timestamp` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create log_entries table
CREATE TABLE IF NOT EXISTS log_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity text NOT NULL,
  project text NOT NULL,
  workers text NOT NULL,
  duration text NOT NULL DEFAULT '00:00:00',
  duration_seconds integer NOT NULL DEFAULT 0,
  upwork_hours numeric DEFAULT 0,
  description text DEFAULT '',
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_status table
CREATE TABLE IF NOT EXISTS user_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not-available',
  memo text,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create active_time_sessions table
CREATE TABLE IF NOT EXISTS active_time_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  duration_seconds integer DEFAULT 0,
  memo text,
  created_at timestamptz DEFAULT now()
);

-- Create morning_checkins table
CREATE TABLE IF NOT EXISTS morning_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_name text NOT NULL,
  project text NOT NULL,
  task text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_time_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE morning_checkins ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read all user data"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Create policies for log_entries table
CREATE POLICY "Users can read all log entries"
  ON log_entries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert log entries"
  ON log_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update log entries"
  ON log_entries
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete log entries"
  ON log_entries
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for user_status table
CREATE POLICY "Users can read all status data"
  ON user_status
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert status data"
  ON user_status
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policies for active_time_sessions table
CREATE POLICY "Users can read all active time sessions"
  ON active_time_sessions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert active time sessions"
  ON active_time_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update active time sessions"
  ON active_time_sessions
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policies for morning_checkins table
CREATE POLICY "Users can read all morning checkins"
  ON morning_checkins
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert morning checkins"
  ON morning_checkins
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete morning checkins"
  ON morning_checkins
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_log_entries_date ON log_entries(date);
CREATE INDEX IF NOT EXISTS idx_log_entries_workers ON log_entries(workers);
CREATE INDEX IF NOT EXISTS idx_log_entries_project ON log_entries(project);
CREATE INDEX IF NOT EXISTS idx_user_status_user_id ON user_status(user_id);
CREATE INDEX IF NOT EXISTS idx_active_time_sessions_user_date ON active_time_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_morning_checkins_timestamp ON morning_checkins(timestamp);