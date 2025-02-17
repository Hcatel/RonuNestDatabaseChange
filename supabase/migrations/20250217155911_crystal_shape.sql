/*
  # Update Visibility Enum Type

  1. Changes
    - Add 'private' as a valid visibility option
    - Preserve existing enum values
    - Handle all dependent policies
  
  2. Details
    - Temporarily drops all affected policies
    - Updates enum type safely
    - Recreates all policies with new enum type
*/

-- Drop all affected policies
drop policy if exists "Anyone can view public modules" on modules;
drop policy if exists "Anyone can view public playlists" on playlists;
drop policy if exists "Anyone can view comments on public modules" on comments;

-- Remove default constraints
alter table modules alter column visibility drop default;
alter table playlists alter column visibility drop default;

-- Create new enum type with additional value
create type visibility_enum_new as enum ('draft', 'public', 'restricted', 'private');

-- Update modules table to use new enum
alter table modules 
  alter column visibility type visibility_enum_new 
  using visibility::text::visibility_enum_new;

-- Update playlists table to use new enum  
alter table playlists
  alter column visibility type visibility_enum_new
  using visibility::text::visibility_enum_new;

-- Add back the default constraints with new type
alter table modules alter column visibility set default 'draft'::visibility_enum_new;
alter table playlists alter column visibility set default 'draft'::visibility_enum_new;

-- Drop old enum type
drop type visibility_enum;

-- Rename new enum type to original name
alter type visibility_enum_new rename to visibility_enum;

-- Recreate all the policies with the updated enum type
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