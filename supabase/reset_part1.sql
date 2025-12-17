-- 1. DROP EVERYTHING (Already done, but safe to run again or skip if clear. We skip drop to accept partial state)
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;
-- GRANT ALL ON SCHEMA public TO postgres;
-- GRANT ALL ON SCHEMA public TO anon;
-- GRANT ALL ON SCHEMA public TO authenticated;
-- GRANT ALL ON SCHEMA public TO service_role;

-- 2. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone_number TEXT,
  address TEXT,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.profiles(id),
  referral_count INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION generate_unique_referral_code()
RETURNS TEXT AS $$
DECLARE
  key TEXT;
  qry TEXT;
  found TEXT;
BEGIN
  qry := 'SELECT referral_code FROM public.profiles WHERE referral_code = $1';
  LOOP
    key := upper(substring(md5(random()::text) from 1 for 6));
    EXECUTE qry INTO found USING key;
    IF found IS NULL THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN key;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ref_code TEXT;
  referrer_id UUID;
BEGIN
  ref_code := generate_unique_referral_code();
  referrer_id := NULL;
  IF new.raw_user_meta_data->>'referral_code' IS NOT NULL THEN
    SELECT id INTO referrer_id FROM public.profiles WHERE referral_code = (new.raw_user_meta_data->>'referral_code');
  END IF;
  INSERT INTO public.profiles (id, full_name, referral_code, referred_by)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', ref_code, referrer_id);
  IF referrer_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET referral_count = referral_count + 1, 
        points = points + 10 
    WHERE id = referrer_id;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. PRODUCTS & PAYMENTS
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    price NUMERIC NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('digital', 'physical')),
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    mpesa_receipt_number TEXT,
    amount NUMERIC,
    phone_number TEXT,
    status TEXT,
    merchant_request_id TEXT,
    checkout_request_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON products FOR SELECT USING (true);
