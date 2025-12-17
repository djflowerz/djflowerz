-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    price NUMERIC NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('digital', 'physical')),
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Payments Table (if not exists, based on callback route usage)
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

-- Seed Initial Data
INSERT INTO products (title, price, category, type, image) VALUES
('Serato DJ Pro Mapping Pack', 1500, 'Software', 'digital', 'https://placehold.co/600x400/1e1b4b/6366f1?text=Serato+Pack'),
('DJ Flowerz Official Hoodie', 3500, 'Merch', 'physical', 'https://placehold.co/600x400/9f1239/fda4af?text=Hoodie'),
('VirtualDJ Sound Effects Vol. 1', 500, 'Software', 'digital', 'https://placehold.co/600x400/0f172a/38bdf8?text=SFX+Pack'),
('Pioneer DJ Controller Skin', 2000, 'Accessories', 'physical', 'https://placehold.co/600x400/334155/94a3b8?text=Skin'),
('Afrobeat Drum Kit', 1000, 'Software', 'digital', 'https://placehold.co/600x400/4c0519/fb7185?text=Drum+Kit'),
('Branded Snapback Cap', 1200, 'Merch', 'physical', 'https://placehold.co/600x400/111827/e5e7eb?text=Cap');

-- Enable RLS (Optional but recommended)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON products FOR SELECT USING (true);
