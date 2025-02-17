/*
  # Add RLS policies for playlist_modules

  1. Changes
    - Add RLS policies to allow playlist creators to manage modules in their playlists
    - Add policies to allow viewing of public playlist modules
    - Add policies for restricted playlist access

  2. Security
    - Enable RLS for playlist_modules table
    - Add policies for insert, select, update, and delete operations
*/

-- Add policies for playlist_modules
create policy "Playlist creators can add modules to their playlists"
  on playlist_modules for insert
  with check (
    exists (
      select 1 from playlists
      where playlists.id = playlist_modules.playlist_id
      and playlists.creator_id = auth.uid()
    )
  );

create policy "Users can view modules in public playlists"
  on playlist_modules for select
  using (
    exists (
      select 1 from playlists
      where playlists.id = playlist_modules.playlist_id
      and (
        playlists.visibility = 'public'
        or playlists.creator_id = auth.uid()
        or exists (
          select 1 from access_control
          where access_control.content_type = 'playlist'
          and access_control.content_id = playlist_modules.playlist_id
          and (
            access_control.profile_id = auth.uid()
            or exists (
              select 1 from group_members
              where group_members.group_id = access_control.group_id
              and group_members.member_id = auth.uid()
            )
          )
        )
      )
    )
  );

create policy "Playlist creators can update module positions"
  on playlist_modules for update
  using (
    exists (
      select 1 from playlists
      where playlists.id = playlist_modules.playlist_id
      and playlists.creator_id = auth.uid()
    )
  );

create policy "Playlist creators can remove modules"
  on playlist_modules for delete
  using (
    exists (
      select 1 from playlists
      where playlists.id = playlist_modules.playlist_id
      and playlists.creator_id = auth.uid()
    )
  );