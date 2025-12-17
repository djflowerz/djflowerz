-- Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone_number TEXT,
  address TEXT,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.profiles(id), -- The user who referred this user
  referral_count INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Function to generate random referral code
CREATE OR REPLACE FUNCTION generate_unique_referral_code()
RETURNS TEXT AS $$
DECLARE
  key TEXT;
  qry TEXT;
  found TEXT;
BEGIN
  qry := 'SELECT referral_code FROM public.profiles WHERE referral_code = $1';
  LOOP
    -- Generate random 6 character string (upper case + numbers)
    key := upper(substring(md5(random()::text) from 1 for 6));
    EXECUTE qry INTO found USING key;
    IF found IS NULL THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN key;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ref_code TEXT;
  referrer_id UUID;
BEGIN
  -- Generate Code
  ref_code := generate_unique_referral_code();
  
  -- Check if referred by someone (passed in metadata)
  -- Note: We assume 'referral_code' is passed in raw_user_meta_data
  referrer_id := NULL;
  IF new.raw_user_meta_data->>'referral_code' IS NOT NULL THEN
    SELECT id INTO referrer_id FROM public.profiles WHERE referral_code = (new.raw_user_meta_data->>'referral_code');
  END IF;

  INSERT INTO public.profiles (id, full_name, referral_code, referred_by)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', ref_code, referrer_id);
  
  -- If referred, update referrer count/points
  IF referrer_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET referral_count = referral_count + 1, 
        points = points + 10 -- 10 points per referral
    WHERE id = referrer_id;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_percent INTEGER NOT NULL DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_to UUID REFERENCES auth.users(id) -- Optional: if coupon is user-specific
);

-- Enable RLS for Coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access Coupons" ON public.coupons FOR SELECT USING (true);

