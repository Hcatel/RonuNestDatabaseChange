/*
  # Fix Storage RLS Policies

  1. Updates
    - Add update policy for storage objects
    - Ensure proper owner checking

  2. Security
    - Maintains existing security model
    - Adds missing update permissions
*/

-- Create storage policy for authenticated users to update files
create policy "Authenticated users can update files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'module-thumbnails' and
  auth.role() = 'authenticated' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create storage policy for authenticated users to update file metadata
create policy "Authenticated users can update file metadata"
on storage.objects for update
to authenticated
with check (
  bucket_id = 'module-thumbnails' and
  auth.role() = 'authenticated' and
  (storage.foldername(name))[1] = auth.uid()::text
);