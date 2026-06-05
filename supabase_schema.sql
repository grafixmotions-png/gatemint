-- ==========================================================
-- GATEMINT DATABASE SETUP SCHEMA
-- ==========================================================
-- Copy and paste this script into your Supabase SQL Editor 
-- (located at: Dashboard -> Project -> SQL Editor -> New Query)
-- and click "Run".
-- ==========================================================

-- 1. Create visitors table
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  visitor_type TEXT NOT NULL,
  purpose TEXT NOT NULL,
  host_department TEXT NOT NULL,
  visit_date TEXT NOT NULL,
  expected_time TEXT NOT NULL,
  qr_code_value TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Approved',
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable Row Level Security (RLS) on both tables
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 4. Enable Public Read, Insert, and Update access policies 
-- (This bypasses Auth restrictions for direct, hassle-free presentation use)
CREATE POLICY "Allow public read access" ON visitors FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON visitors FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON activity_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON activity_logs FOR INSERT WITH CHECK (true);

-- 5. Enable Supabase Realtime broadcast on both tables
-- (Crucial for live phone-to-laptop updates!)
ALTER PUBLICATION supabase_realtime ADD TABLE visitors;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;
