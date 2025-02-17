/*
  # Fix module access policy

  1. Changes
    - Drop existing problematic policy
    - Create simpler, non-recursive policy for module access
    - Add separate policies for different operations
*/

-- Drop existing problematic policy
drop policy if exists "Module view policy" on modules;

-- Create separate policies for different visibility levels
create policy "Anyone can view public modules"
  on modules for select
  using (visibility = 'public');

create policy "Creator can view own modules"
  on modules for select
  using (creator_id = auth.uid());

create policy "Users can view restricted modules with access"
  on modules for select
  using (
    visibility = 'restricted' and
    exists (
      select 1
      from module_access
      where module_access.module_id = id
      and module_access.user_id = auth.uid()
    )
  );

-- Ensure creator can perform all operations on their modules
create policy "Creator has full access"
  on modules
  using (creator_id = auth.uid());