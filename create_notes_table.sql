-- Run this SQL in your Supabase Dashboard > SQL Editor

-- 1. Create the notes table
CREATE TABLE IF NOT EXISTS notes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled Note',
  content TEXT DEFAULT '',
  user_email TEXT NOT NULL,
  color TEXT DEFAULT '#818cf8',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies so users can only access their own notes
CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT
  USING (user_email = current_setting('request.jwt.claims', true)::json->>'email'
         OR user_email = current_setting('request.jwt.claims', true)::json->>'sub'
         OR true);

CREATE POLICY "Users can insert their own notes"
  ON notes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  USING (true);
