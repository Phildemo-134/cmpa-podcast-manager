-- Add S3 fields to episodes table
ALTER TABLE public.episodes 
ADD COLUMN IF NOT EXISTS s3_key TEXT,
ADD COLUMN IF NOT EXISTS s3_bucket TEXT;

-- Add index on s3_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_episodes_s3_key ON public.episodes(s3_key);

-- Add index on user_id and s3_key for user-specific lookups
CREATE INDEX IF NOT EXISTS idx_episodes_user_s3 ON public.episodes(user_id, s3_key);

-- Update existing episodes to have empty s3_key if NULL
UPDATE public.episodes 
SET s3_key = '' 
WHERE s3_key IS NULL;

-- Update existing episodes to have empty s3_bucket if NULL
UPDATE public.episodes 
SET s3_bucket = '' 
WHERE s3_bucket IS NULL;
