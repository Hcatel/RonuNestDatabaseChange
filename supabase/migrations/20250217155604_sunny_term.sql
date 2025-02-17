/*
  # Fix Storage Policies for File Upload

  1. Updates
    - Modify storage policies to handle file paths correctly
    - Ensure proper owner assignment on upload
    - Add missing insert policy fields

  2. Security
    - Maintains existing security model
    - Ensures proper file ownership
*/

-- Drop existing policies to recreate them with correct settings
drop policy if exists "Authenticated users can upload files" on storage.objects;
drop policy if exists "Users can delete own files" on storage.objects;
drop policy if exists "Authenticated users can update files" on storage.objects;
drop policy if exists "Authenticated users can update file metadata" on storage.objects;

-- Create improved upload policy
create policy "Authenticated users can upload files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'module-thumbnails' and
  auth.role() = 'authenticated' and
  (auth.uid() = owner)
);

-- Create improved delete policy
create policy "Users can delete own files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'module-thumbnails' and
  auth.uid() = owner
);

-- Create improved update policy
create policy "Authenticated users can update files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'module-thumbnails' and
  auth.role() = 'authenticated' and
  auth.uid() = owner
);