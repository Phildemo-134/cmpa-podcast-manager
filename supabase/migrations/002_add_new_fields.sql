-- Add new fields to episodes table
ALTER TABLE public.episodes 
ADD COLUMN IF NOT EXISTS timestamps TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add new field to transcriptions table
ALTER TABLE public.transcriptions 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'raw' CHECK (type IN ('raw', 'enhanced'));

-- Update existing transcriptions to have type 'raw' by default
UPDATE public.transcriptions 
SET type = 'raw' 
WHERE type IS NULL;
