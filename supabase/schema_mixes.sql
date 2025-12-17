
-- Genres Table
CREATE TABLE IF NOT EXISTS public.genres (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Mixes Table
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

-- Products Table (Expanded)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT,
  product_type TEXT CHECK (product_type IN ('equipment', 'software', 'merch')) DEFAULT 'merch',
  file_url TEXT, -- For digital downloads
  password TEXT, -- Password for extraction (for software)
  stock INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, completed, cancelled
  mpesa_receipt_number TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_phone TEXT,
  items JSONB, -- Store cart snapshot
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_type TEXT NOT NULL, -- '1_month', '3_months', '6_months', '12_months'
  start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Newsletter Table
CREATE TABLE IF NOT EXISTS public.newsletter (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter ENABLE ROW LEVEL SECURITY;

-- Policies
-- Genres & Mixes (Public Read, Admin Write)
CREATE POLICY "Allow public read access to genres" ON public.genres FOR SELECT TO public USING (true);
CREATE POLICY "Allow admin write access to genres" ON public.genres FOR ALL TO authenticated USING (auth.email() = 'ianmuriithiflowerz@gmail.com');

CREATE POLICY "Allow public read access to mixes" ON public.mixes FOR SELECT TO public USING (true);
CREATE POLICY "Allow admin write access to mixes" ON public.mixes FOR ALL TO authenticated USING (auth.email() = 'ianmuriithiflowerz@gmail.com');

-- Products (Public Read, Admin Write)
CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT TO public USING (true);
CREATE POLICY "Allow admin write access to products" ON public.products FOR ALL TO authenticated USING (auth.email() = 'ianmuriithiflowerz@gmail.com');

-- Orders (User Read Own, Admin Read All/Write)
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all orders" ON public.orders FOR SELECT TO authenticated USING (auth.email() = 'ianmuriithiflowerz@gmail.com');

-- Subscriptions (User Read Own, Admin Read All)
CREATE POLICY "Users can view own sub" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all subs" ON public.subscriptions FOR SELECT TO authenticated USING (auth.email() = 'ianmuriithiflowerz@gmail.com');

-- Newsletter (Public Insert, Admin Read)
CREATE POLICY "Public can subscribe" ON public.newsletter FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admin can view newsletter" ON public.newsletter FOR SELECT TO authenticated USING (auth.email() = 'ianmuriithiflowerz@gmail.com');

-- Seed Data (Genres)
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

-- Tips Table
CREATE TABLE IF NOT EXISTS public.tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  message TEXT,
  mpesa_receipt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bookings Table
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

-- RLS for Tips and Bookings
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert tips" ON public.tips FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admin can view tips" ON public.tips FOR SELECT TO authenticated USING (auth.email() = 'ianmuriithiflowerz@gmail.com');

CREATE POLICY "Public can insert bookings" ON public.bookings FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admin can view bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.email() = 'ianmuriithiflowerz@gmail.com');


-- Enable Realtime for relevant tables
-- Note: 'supabase_realtime' publication exists by default in Supabase, we just add tables to it.
alter publication supabase_realtime add table mixes;
alter publication supabase_realtime add table subscriptions;
alter publication supabase_realtime add table tips;
alter publication supabase_realtime add table bookings;
alter publication supabase_realtime add table orders;
