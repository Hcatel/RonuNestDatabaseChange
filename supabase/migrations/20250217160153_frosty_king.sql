/*
  # Remove Private Visibility Level

  1. Changes
    - Remove 'private' from visibility_enum
    - Convert existing 'private' content to 'restricted'
    - Update default values and policies
  
  2. Details
    - Simplifies visibility options to draft/public/restricted
    - Maintains access control through existing mechanisms
    - Preserves content privacy through restricted + access control
*/

-- Drop all affected policies first
drop policy if exists "Anyone can view public modules" on modules;
drop policy if exists "Anyone can view public playlists" on playlists;
drop policy if exists "Anyone can view comments on public modules" on comments;

-- Remove default constraints
alter table modules alter column visibility drop default;
alter table playlists alter column visibility drop default;

-- Update existing content to use 'restricted' instead of 'private'
update modules 
set visibility = 'restricted'::visibility_enum 
where visibility = 'private'::visibility_enum;

update playlists 
set visibility = 'restricted'::visibility_enum 
where visibility = 'private'::visibility_enum;

-- Create temporary enum without 'private'
create type visibility_enum_temp as enum ('draft', 'public', 'restricted');

-- Create conversion function
create or replace function visibility_enum_convert(old_enum visibility_enum) 
returns visibility_enum_temp as $$
  select case old_enum::text
    when 'draft' then 'draft'::visibility_enum_temp
    when 'public' then 'public'::visibility_enum_temp
    when 'restricted' then 'restricted'::visibility_enum_temp
    when 'private' then 'restricted'::visibility_enum_temp
  end;
$$ language sql immutable;

-- Update tables to use new enum
alter table modules 
  alter column visibility type visibility_enum_temp 
  using visibility_enum_convert(visibility);

alter table playlists
  alter column visibility type visibility_enum_temp
  using visibility_enum_convert(visibility);

-- Add back default values
alter table modules alter column visibility set default 'draft'::visibility_enum_temp;
alter table playlists alter column visibility set default 'draft'::visibility_enum_temp;

-- Drop old enum and conversion function
drop function visibility_enum_convert(visibility_enum);
drop type visibility_enum;

-- Rename temp enum to final name
alter type visibility_enum_temp rename to visibility_enum;

-- Recreate policies with new enum
create policy "Anyone can view public modules"
  on modules for select
  using (visibility = 'public'::visibility_enum);

create policy "Anyone can view public playlists"
  on playlists for select
  using (visibility = 'public'::visibility_enum);

create policy "Anyone can view comments on public modules"
  on comments for select
  using (
    exists (
      select 1 from modules
      where modules.id = comments.module_id
      and modules.visibility = 'public'::visibility_enum
    )
  );