/*
  # Add module access policies

  1. Changes
    - Add policy for users to view modules they have been granted access to
    - Update public modules policy to be more explicit
    - Add policy for users to view their own modules

  Note: This ensures users can see:
    - All public modules
    - Modules they've been granted access to
    - Their own modules
*/

-- Drop existing policies to avoid conflicts
drop policy if exists "Users can view public modules" on modules;
drop policy if exists "Users can view restricted modules they have access to" on modules;
drop policy if exists "Users can view their own modules" on modules;

-- Recreate policies with proper access controls
create policy "Users can view public modules"
  on modules for select
  using (visibility = 'public'::module_visibility);

create policy "Users can view restricted modules they have access to"
  on modules for select
  using (
    visibility = 'restricted'::module_visibility and
    exists (
      select 1 from module_access
      where module_id = modules.id
      and user_id = auth.uid()
    )
  );

create policy "Users can view their own modules"
  on modules for select
  using (creator_id = auth.uid());