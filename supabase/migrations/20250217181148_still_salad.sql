/*
  # Create playlist items table

  1. New Tables
    - `playlist_items`
      - `id` (uuid, primary key)
      - `playlist_id` (uuid, references playlists)
      - `module_id` (uuid, references modules)
      - `sub_playlist_id` (uuid, references playlists)
      - `position` (int)
      - `created_at` (timestamptz)

  2. Changes
    - Adds support for both modules and sub-playlists in a single table
    - Ensures proper foreign key relationships with UUID columns
    - Maintains position ordering
    - Prevents self-referencing playlists

  3. Security
    - Enables RLS
    - Adds policies for playlist creators and viewers
*/

-- Create playlist items table
create table playlist_items (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid references playlists(id) on delete cascade,
  module_id uuid references modules(id),
  sub_playlist_id uuid references playlists(id),
  position int not null,
  created_at timestamptz default now(),
  -- Ensure either module_id or sub_playlist_id is set, but not both
  constraint module_or_playlist check (
    (module_id is not null and sub_playlist_id is null) or
    (module_id is null and sub_playlist_id is not null)
  ),
  -- Prevent self-referencing playlists
  constraint no_self_reference check (
    playlist_id != sub_playlist_id
  ),
  -- Ensure unique position per playlist
  unique(playlist_id, position)
);

-- Enable RLS
alter table playlist_items enable row level security;

-- Create indexes
create index idx_playlist_items_playlist on playlist_items(playlist_id);
create index idx_playlist_items_module on playlist_items(module_id);
create index idx_playlist_items_sub_playlist on playlist_items(sub_playlist_id);
create index idx_playlist_items_position on playlist_items(position);

-- Create RLS policies
create policy "Playlist creators can manage items"
  on playlist_items
  for all
  using (
    exists (
      select 1 from playlists
      where playlists.id = playlist_items.playlist_id
      and playlists.creator_id = auth.uid()
    )
  );

create policy "Users can view items in accessible playlists"
  on playlist_items
  for select
  using (
    exists (
      select 1 from playlists
      where playlists.id = playlist_items.playlist_id
      and (
        playlists.creator_id = auth.uid()
        or playlists.visibility = 'public'
        or exists (
          select 1 from access_control
          where content_type = 'playlist'
          and content_id = playlists.id
          and profile_id = auth.uid()
        )
        or exists (
          select 1 from access_control ac
          join group_members gm on gm.group_id = ac.group_id
          where ac.content_type = 'playlist'
          and ac.content_id = playlists.id
          and gm.member_id = auth.uid()
        )
      )
    )
  );