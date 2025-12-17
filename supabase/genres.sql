-- Create Genres Table if not exists
CREATE TABLE IF NOT EXISTS genres (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access Genres" ON genres FOR SELECT USING (true);


-- Insert Genres (Ignoring duplicates)
INSERT INTO genres (name) VALUES
('Mashups'),
('Redrums'),
('Bongo Flava'),
('Reggae'),
('Arbantone'),
('Gengetone'),
('RnB'),
('Crunk'),
('Afrobeats'),
('Ragga'),
('Drill'),
('Rhumba'),
('Roots'),
('Dancehall'),
('Mugithi'),
('Gospel'),
('South African Amapiano'),
('East African Amapiano'),
('Kenyan Love Songs'),
('Lovers Rock')
ON CONFLICT (name) DO NOTHING;
