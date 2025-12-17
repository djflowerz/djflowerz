-- Enhanced Features Schema

-- Products: Add images array column
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[];

-- Mixes: Add media link columns
ALTER TABLE mixes ADD COLUMN IF NOT EXISTS audio_stream_url TEXT; -- For streaming
ALTER TABLE mixes ADD COLUMN IF NOT EXISTS audio_download_url TEXT; -- For MP3 download
ALTER TABLE mixes ADD COLUMN IF NOT EXISTS video_download_url TEXT; -- For Video download
ALTER TABLE mixes ADD COLUMN IF NOT EXISTS cover_art TEXT; -- Ensure cover art exists
