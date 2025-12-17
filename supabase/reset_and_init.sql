-- 1. DROP EVERYTHING
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- 2. PROFILES (profiles.sql)
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

-- 3. PRODUCTS & PAYMENTS (from schema.sql - MATCHES CODEBASE)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY, -- Note: schema_mixes used UUID. Code likely handles standard IDs? Admin page sets nothing, assumes DB gen.
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

-- 4. MIXES, GENRES, ORDERS, ETC (from schema_mixes.sql)
-- We use this for everything EXCEPT products.

-- Genres
CREATE TABLE IF NOT EXISTS public.genres (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Mixes
CREATE TABLE IF NOT EXISTS public.mixes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  genre_id UUID REFERENCES public.genres(id) ON DELETE CASCADE,
  youtube_url TEXT,
  download_url TEXT,
  description TEXT,
  is_premium BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders (Modified to match schema_mixes but adapt if needed)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  mpesa_receipt_number TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_phone TEXT,
  items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_type TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Newsletter
CREATE TABLE IF NOT EXISTS public.newsletter (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tips
CREATE TABLE IF NOT EXISTS public.tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  message TEXT,
  mpesa_receipt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  event_date TIMESTAMP WITH TIME ZONE,
  event_type TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mixes ENABLE ROW LEVEL SECURITY;
-- Products already enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to genres" ON public.genres FOR SELECT TO public USING (true);
CREATE POLICY "Allow admin write access to genres" ON public.genres FOR ALL TO authenticated USING (auth.email() = 'ianmuriithiflowerz@gmail.com');

CREATE POLICY "Allow public read access to mixes" ON public.mixes FOR SELECT TO public USING (true);
CREATE POLICY "Allow admin write access to mixes" ON public.mixes FOR ALL TO authenticated USING (auth.email() = 'ianmuriithiflowerz@gmail.com');

CREATE POLICY "Allow admin write access to products" ON public.products FOR ALL TO authenticated USING (auth.email() = 'ianmuriithiflowerz@gmail.com');

CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all orders" ON public.orders FOR SELECT TO authenticated USING (auth.email() = 'ianmuriithiflowerz@gmail.com');

CREATE POLICY "Users can view own sub" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all subs" ON public.subscriptions FOR SELECT TO authenticated USING (auth.email() = 'ianmuriithiflowerz@gmail.com');

CREATE POLICY "Public can subscribe" ON public.newsletter FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admin can view newsletter" ON public.newsletter FOR SELECT TO authenticated USING (auth.email() = 'ianmuriithiflowerz@gmail.com');

CREATE POLICY "Public can insert tips" ON public.tips FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admin can view tips" ON public.tips FOR SELECT TO authenticated USING (auth.email() = 'ianmuriithiflowerz@gmail.com');

CREATE POLICY "Public can insert bookings" ON public.bookings FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admin can view bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.email() = 'ianmuriithiflowerz@gmail.com');

-- Seed Genres
INSERT INTO public.genres (name, slug) VALUES
('Mashups', 'mashups'),
('Redrums', 'redrums'),
('Bongo Flava', 'bongo-flava'),
('Reggae', 'reggae'),
('Arbantone', 'arbantone'),
('Gengetone', 'gengetone'),
('RnB', 'rnb'),
('Crunk', 'crunk'),
('Afrobeats', 'afrobeats'),
('Ragga', 'ragga'),
('Drill', 'drill'),
('Rhumba', 'rhumba'),
('Roots', 'roots'),
('Dancehall', 'dancehall'),
('Mugithi', 'mugithi'),
('Gospel', 'gospel'),
('South African Amapiano', 'south-african-amapiano'),
('East African Amapiano', 'east-african-amapiano'),
('Kenyan Love Songs', 'kenyan-love-songs'),
('Lovers Rock', 'lovers-rock'),
('Hip Hop', 'hip-hop')
ON CONFLICT (name) DO NOTHING;

-- Seed Products (from schema.sql)
INSERT INTO products (title, price, category, type, image) VALUES
('Serato DJ Pro Mapping Pack', 1500, 'Software', 'digital', 'https://placehold.co/600x400/1e1b4b/6366f1?text=Serato+Pack'),
('DJ Flowerz Official Hoodie', 3500, 'Merch', 'physical', 'https://placehold.co/600x400/9f1239/fda4af?text=Hoodie'),
('VirtualDJ Sound Effects Vol. 1', 500, 'Software', 'digital', 'https://placehold.co/600x400/0f172a/38bdf8?text=SFX+Pack'),
('Pioneer DJ Controller Skin', 2000, 'Accessories', 'physical', 'https://placehold.co/600x400/334155/94a3b8?text=Skin'),
('Afrobeat Drum Kit', 1000, 'Software', 'digital', 'https://placehold.co/600x400/4c0519/fb7185?text=Drum+Kit'),
('Branded Snapback Cap', 1200, 'Merch', 'physical', 'https://placehold.co/600x400/111827/e5e7eb?text=Cap');

-- 5. STORAGE BUCKETS (storage.sql)
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('mixtapes', 'mixtapes', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Products" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Allow Uploads Products" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products');

CREATE POLICY "Public Access Mixtapes" ON storage.objects FOR SELECT USING (bucket_id = 'mixtapes');
CREATE POLICY "Allow Uploads Mixtapes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'mixtapes');

-- 6. ENHANCEMENTS (enhanced_schema.sql)
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE mixes ADD COLUMN IF NOT EXISTS audio_stream_url TEXT; 
ALTER TABLE mixes ADD COLUMN IF NOT EXISTS audio_download_url TEXT; 
ALTER TABLE mixes ADD COLUMN IF NOT EXISTS video_download_url TEXT; 
ALTER TABLE mixes ADD COLUMN IF NOT EXISTS cover_art TEXT; 

-- 7. FINAL UPDATES (final_schema_updates.sql)
ALTER TABLE genres ADD COLUMN IF NOT EXISTS external_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS download_link TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS file_password TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- Realtime
alter publication supabase_realtime add table mixes;
alter publication supabase_realtime add table subscriptions;
alter publication supabase_realtime add table tips;
alter publication supabase_realtime add table bookings;
alter publication supabase_realtime add table orders;
