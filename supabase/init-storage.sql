-- Create storage bucket for podcast audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'podcast-audio',
  'podcast-audio',
  true,
  524288000, -- 500MB in bytes
  ARRAY['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aac', 'audio/ogg']
) ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for podcast video files (if needed in the future)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'podcast-video',
  'podcast-video',
  true,
  2147483648, -- 2GB in bytes
  ARRAY['video/mp4', 'video/webm', 'video/avi', 'video/mov']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the podcast-audio bucket
CREATE POLICY "Users can upload their own audio files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'podcast-audio' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own audio files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'podcast-audio' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own audio files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'podcast-audio' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own audio files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'podcast-audio' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
