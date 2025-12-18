-- OTP Verifications table for storing temporary OTPs during signup
-- This replaces the in-memory storage that doesn't work across serverless function instances

CREATE TABLE IF NOT EXISTS public.otp_verifications (
  email TEXT PRIMARY KEY,
  otp_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS but allow service role full access
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table (via Netlify functions)
-- No public access needed since this is only used by backend functions
CREATE POLICY "Service role full access" ON public.otp_verifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Auto-cleanup function to remove expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM public.otp_verifications WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires_at 
  ON public.otp_verifications(expires_at);
