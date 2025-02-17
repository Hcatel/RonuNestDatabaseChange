/*
  # Fix module access policies

  1. Changes
    - Drop all existing module policies
    - Create a single comprehensive SELECT policy
    - Create separate INSERT/UPDATE/DELETE policies
    - Avoid recursive policy checks
*/

-- Drop all existing module policies
drop policy if exists "Anyone can view public modules" on modules;
drop policy if exists "Creator can view own modules" on modules;
drop policy if exists "Users can view restricted modules with access" on modules;
drop policy if exists "Creator has full access" on modules;

-- Create a single SELECT policy that covers all cases
create policy "module_select_policy"
  on modules for select
  using (
    visibility = 'public'
    or creator_id = auth.uid()
    or (
      visibility = 'restricted'
      and exists (
        select 1 from module_access
        where module_access.module_id = modules.id
        and module_access.user_id = auth.uid()
      )
    )
  );

-- Create separate policies for other operations
create policy "module_insert_policy"
  on modules for insert
  with check (creator_id = auth.uid());

create policy "module_update_policy"
  on modules for update
  using (creator_id = auth.uid());

create policy "module_delete_policy"
  on modules for delete
  using (creator_id = auth.uid());