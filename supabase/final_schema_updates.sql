-- Update Genres for External Links
ALTER TABLE genres ADD COLUMN IF NOT EXISTS external_url TEXT;

-- Update Products for Software Delivery
ALTER TABLE products ADD COLUMN IF NOT EXISTS download_link TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS file_password TEXT;

-- Update Orders for Shipping Tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_status TEXT DEFAULT 'pending'; -- pending, shipped, delivered
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
