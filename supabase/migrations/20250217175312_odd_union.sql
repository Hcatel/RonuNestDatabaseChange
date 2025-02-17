/*
  # Add RLS policies for playlist_modules table

  1. Policies Added
    - Allow playlist creators to manage modules in their playlists
    - Allow viewing of modules in public playlists
    - Allow viewing of modules in playlists user has access to

  2. Changes
    - Add policies for select, insert, update, and delete operations
    - Ensure proper access control based on playlist ownership and visibility
*/

-- Policy for playlist creators to manage their playlist modules
create policy "Playlist creators can manage modules in their playlists"
  on playlist_modules
  for all
  using (
    exists (
      select 1 from playlists
      where playlists.id = playlist_modules.playlist_id
      and playlists.creator_id = auth.uid()
    )
  );

-- Policy for viewing modules in public playlists
create policy "Anyone can view modules in public playlists"
  on playlist_modules
  for select
  using (
    exists (
      select 1 from playlists
      where playlists.id = playlist_modules.playlist_id
      and playlists.visibility = 'public'
    )
  );

-- Policy for viewing modules in playlists user has access to
create policy "Users can view modules in playlists they have access to"
  on playlist_modules
  for select
  using (
    exists (
      select 1 from playlists
      where playlists.id = playlist_modules.playlist_id
      and (
        -- User is the creator
        playlists.creator_id = auth.uid()
        or
        -- Playlist is public
        playlists.visibility = 'public'
        or
        -- User has explicit access through access_control
        exists (
          select 1 from access_control
          where access_control.content_type = 'playlist'
          and access_control.content_id = playlists.id
          and access_control.profile_id = auth.uid()
        )
        or
        -- User has access through group membership
        exists (
          select 1 from access_control ac
          join group_members gm on gm.group_id = ac.group_id
          where ac.content_type = 'playlist'
          and ac.content_id = playlists.id
          and gm.member_id = auth.uid()
        )
      )
    )
  );