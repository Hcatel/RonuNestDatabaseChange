/*
  # Content Management Schema

  1. New Tables
    - `modules`
      - Core module information
      - Accessibility controls
      - Timestamps and metadata
    - `module_access`
      - Controls access for restricted modules
      - Links users/groups to modules
    - `playlists`
      - Playlist information
      - Support for nested playlists
      - Accessibility controls
    - `playlist_modules`
      - Junction table for modules in playlists
      - Maintains module order
    - `media_files`
      - Stores media file metadata
      - Links to Supabase storage
  
  2. Security
    - Enable RLS on all tables
    - Policies for:
      - Module access based on visibility
      - Playlist management
      - Media file ownership
*/

-- Create enum for module accessibility
create type module_visibility as enum ('draft', 'private', 'public', 'restricted');

-- Modules table
create table modules (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references auth.users(id) not null,
  title text not null,
  description text,
  thumbnail_url text,
  visibility module_visibility not null default 'draft',
  duration interval,
  views bigint default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Module access control for restricted modules
create table module_access (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references modules(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade,
  group_id uuid, -- For future group implementation
  created_at timestamptz default now(),
  unique(module_id, user_id),
  unique(module_id, group_id),
  check (
    (user_id is not null and group_id is null) or
    (user_id is null and group_id is not null)
  )
);

-- Playlists table with support for nesting
create table playlists (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references auth.users(id) not null,
  parent_playlist_id uuid references playlists(id),
  title text not null,
  description text,
  thumbnail_url text,
  visibility module_visibility not null default 'private',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Junction table for modules in playlists
create table playlist_modules (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid references playlists(id) on delete cascade not null,
  module_id uuid references modules(id) on delete cascade not null,
  position integer not null,
  created_at timestamptz default now(),
  unique(playlist_id, module_id),
  unique(playlist_id, position)
);

-- Media files table
create table media_files (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references auth.users(id) not null,
  filename text not null,
  original_filename text not null,
  file_size bigint not null,
  mime_type text not null,
  storage_path text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint file_size_limit check (file_size <= 524288000) -- 500MB in bytes
);

-- Enable Row Level Security
alter table modules enable row level security;
alter table module_access enable row level security;
alter table playlists enable row level security;
alter table playlist_modules enable row level security;
alter table media_files enable row level security;

-- Modules policies
create policy "Users can view public modules"
  on modules for select
  using (visibility = 'public');

create policy "Users can view their own modules"
  on modules for select
  using (creator_id = auth.uid());

create policy "Users can view restricted modules they have access to"
  on modules for select
  using (
    visibility = 'restricted' and
    exists (
      select 1 from module_access
      where module_id = modules.id
      and user_id = auth.uid()
    )
  );

create policy "Users can create modules"
  on modules for insert
  with check (creator_id = auth.uid());

create policy "Users can update their own modules"
  on modules for update
  using (creator_id = auth.uid());

create policy "Users can delete their own modules"
  on modules for delete
  using (creator_id = auth.uid());

-- Module access policies
create policy "Module creators can manage access"
  on module_access
  using (
    exists (
      select 1 from modules
      where id = module_access.module_id
      and creator_id = auth.uid()
    )
  );

-- Playlists policies
create policy "Users can view public playlists"
  on playlists for select
  using (visibility = 'public');

create policy "Users can view their own playlists"
  on playlists for select
  using (creator_id = auth.uid());

create policy "Users can create playlists"
  on playlists for insert
  with check (creator_id = auth.uid());

create policy "Users can update their own playlists"
  on playlists for update
  using (creator_id = auth.uid());

create policy "Users can delete their own playlists"
  on playlists for delete
  using (creator_id = auth.uid());

-- Playlist modules policies
create policy "Users can view playlist modules for accessible playlists"
  on playlist_modules for select
  using (
    exists (
      select 1 from playlists
      where id = playlist_modules.playlist_id
      and (
        visibility = 'public'
        or creator_id = auth.uid()
      )
    )
  );

create policy "Users can manage modules in their playlists"
  on playlist_modules
  using (
    exists (
      select 1 from playlists
      where id = playlist_modules.playlist_id
      and creator_id = auth.uid()
    )
  );

-- Media files policies
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

-- Functions for updating timestamps
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updating timestamps
create trigger update_modules_updated_at
  before update on modules
  for each row execute function update_updated_at();

create trigger update_playlists_updated_at
  before update on playlists
  for each row execute function update_updated_at();

create trigger update_media_files_updated_at
  before update on media_files
  for each row execute function update_updated_at();