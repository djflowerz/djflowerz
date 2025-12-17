-- Policies
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

-- Seed Products
INSERT INTO products (title, price, category, type, image) VALUES
('Serato DJ Pro Mapping Pack', 1500, 'Software', 'digital', 'https://placehold.co/600x400/1e1b4b/6366f1?text=Serato+Pack'),
('DJ Flowerz Official Hoodie', 3500, 'Merch', 'physical', 'https://placehold.co/600x400/9f1239/fda4af?text=Hoodie'),
('VirtualDJ Sound Effects Vol. 1', 500, 'Software', 'digital', 'https://placehold.co/600x400/0f172a/38bdf8?text=SFX+Pack'),
('Pioneer DJ Controller Skin', 2000, 'Accessories', 'physical', 'https://placehold.co/600x400/334155/94a3b8?text=Skin'),
('Afrobeat Drum Kit', 1000, 'Software', 'digital', 'https://placehold.co/600x400/4c0519/fb7185?text=Drum+Kit'),
('Branded Snapback Cap', 1200, 'Merch', 'physical', 'https://placehold.co/600x400/111827/e5e7eb?text=Cap');

-- Storage & Enhancements
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('mixtapes', 'mixtapes', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Products" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Allow Uploads Products" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products');

CREATE POLICY "Public Access Mixtapes" ON storage.objects FOR SELECT USING (bucket_id = 'mixtapes');
CREATE POLICY "Allow Uploads Mixtapes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'mixtapes');

ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE mixes ADD COLUMN IF NOT EXISTS audio_stream_url TEXT; 
ALTER TABLE mixes ADD COLUMN IF NOT EXISTS audio_download_url TEXT; 
ALTER TABLE mixes ADD COLUMN IF NOT EXISTS video_download_url TEXT; 
ALTER TABLE mixes ADD COLUMN IF NOT EXISTS cover_art TEXT; 

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
