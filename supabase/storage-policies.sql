-- Storage policies for tasting-photos bucket
-- Allow public read access to tasting photos
CREATE POLICY "Public access to tasting photos" ON storage.objects
FOR SELECT USING (bucket_id = 'tasting-photos');

-- Allow authenticated users to upload their own tasting photos
CREATE POLICY "Users can upload their own tasting photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'tasting-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own tasting photos
CREATE POLICY "Users can update their own tasting photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'tasting-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own tasting photos
CREATE POLICY "Users can delete their own tasting photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'tasting-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);