CREATE TABLE IF NOT EXISTS resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  resume_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all select on resumes') THEN
    CREATE POLICY "Allow all select on resumes" ON resumes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all insert on resumes') THEN
    CREATE POLICY "Allow all insert on resumes" ON resumes FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all update on resumes') THEN
    CREATE POLICY "Allow all update on resumes" ON resumes FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all delete on resumes') THEN
    CREATE POLICY "Allow all delete on resumes" ON resumes FOR DELETE USING (true);
  END IF;
END $$;
