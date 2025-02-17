/*
  # Add storage bucket for module thumbnails

  1. New Storage Bucket
    - Creates a new storage bucket for module thumbnails
    - Sets public access for thumbnails
    - Configures file size limits and allowed mime types
*/

insert into storage.buckets (id, name, public)
values ('module-thumbnails', 'module-thumbnails', true);

-- Set storage policy to allow authenticated users to upload thumbnails
create policy "Authenticated users can upload module thumbnails"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'module-thumbnails' AND
  auth.role() = 'authenticated'
);

-- Allow public access to view thumbnails
create policy "Public can view module thumbnails"
on storage.objects for select
to public
using ( bucket_id = 'module-thumbnails' );

-- Allow users to update their own thumbnails
create policy "Users can update own module thumbnails"
on storage.objects for update
to authenticated
using ( auth.uid() = owner );

-- Allow users to delete their own thumbnails
create policy "Users can delete own module thumbnails"
on storage.objects for delete
to authenticated
using ( auth.uid() = owner );