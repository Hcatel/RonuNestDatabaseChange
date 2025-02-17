/*
  # Create Storage Bucket for Module Thumbnails

  1. New Storage
    - Creates module-thumbnails bucket for storing media files
    - Public access enabled for thumbnails

  2. Security
    - Policies for authenticated uploads
    - Public download access
    - Owner-only deletion rights
*/

-- Create storage bucket
insert into storage.buckets (id, name, public)
values ('module-thumbnails', 'module-thumbnails', true);

-- Create storage policy for authenticated uploads
create policy "Authenticated users can upload files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'module-thumbnails' and
  auth.role() = 'authenticated' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create storage policy for public downloads
create policy "Public users can download files"
on storage.objects for select
to public
using (bucket_id = 'module-thumbnails');

-- Create storage policy for owner deletes
create policy "Users can delete own files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'module-thumbnails' and
  (storage.foldername(name))[1] = auth.uid()::text
);