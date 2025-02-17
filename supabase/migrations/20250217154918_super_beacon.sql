/*
  # Add Media Files Table

  1. New Tables
    - media_files: Store media file metadata
      - id (uuid): Primary key
      - creator_id (uuid): References profiles
      - filename (text): Storage filename
      - original_filename (text): Original upload name
      - file_size (bigint): Size in bytes
      - mime_type (text): File MIME type
      - storage_path (text): Storage location
      - created_at (timestamptz): Creation timestamp
      - updated_at (timestamptz): Update timestamp

  2. Security
    - RLS enabled
    - Policies for creator access
    - Indexes for performance

  3. Changes
    - UUID for auth integration
    - Automatic timestamp updates
*/

-- Create media_files table
create table if not exists media_files (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references profiles(id),
  filename text not null,
  original_filename text not null,
  file_size bigint not null,
  mime_type text not null,
  storage_path text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table media_files enable row level security;

-- Create indexes
create index idx_media_files_creator on media_files(creator_id);
create index idx_media_files_mime_type on media_files(mime_type);

-- Create RLS policies
create policy "Users can view their own media files"
  on media_files for select
  using (creator_id = auth.uid());

create policy "Users can upload media files"
  on media_files for insert
  with check (creator_id = auth.uid());

create policy "Users can update their own media files"
  on media_files for update
  using (creator_id = auth.uid());

create policy "Users can delete their own media files"
  on media_files for delete
  using (creator_id = auth.uid());

-- Create updated_at trigger
create trigger update_media_files_updated_at
  before update on media_files
  for each row
  execute function update_updated_at_column();