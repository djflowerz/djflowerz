-- Create Storage Buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('mixtapes', 'mixtapes', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public viewing of products
CREATE POLICY "Public Access Products" ON storage.objects FOR SELECT USING (bucket_id = 'products');

-- Policy to allow authenticated uploads to products (or public if you want for now, but auth is better)
-- For simplicity in this demo, we allow anyone to upload (NOT RECCOMMENDED FOR PROD without Auth check)
CREATE POLICY "Allow Uploads Products" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products');


-- Policy to allow public viewing of mixtapes
CREATE POLICY "Public Access Mixtapes" ON storage.objects FOR SELECT USING (bucket_id = 'mixtapes');

-- Policy to allow uploads to mixtapes
CREATE POLICY "Allow Uploads Mixtapes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'mixtapes');
