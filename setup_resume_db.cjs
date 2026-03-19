const https = require('https');

const SUPABASE_URL = 'pxrrcepvbczjctrnyjfe.supabase.co';
const SERVICE_KEY = 'YOUR_SUPABASE_SERVICE_ROLE_KEY'; // Replace with your actual service role key

const sql = `
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
`;

const body = JSON.stringify({ query: sql });

const options = {
  hostname: SUPABASE_URL,
  path: '/rest/v1/rpc/',
  method: 'POST',
  headers: {
    'apikey': SERVICE_KEY,
    'Authorization': 'Bearer ' + SERVICE_KEY,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(body);
req.end();
