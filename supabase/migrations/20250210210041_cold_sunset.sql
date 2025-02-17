/*
  # Simplify module access policies

  1. Changes
    - Remove complex restricted access checks
    - Simplify to basic public/private visibility
    - Keep creator access rights
    
  2. Security
    - Maintain RLS
    - Ensure creators can manage their modules
    - Allow public access to public modules
*/

-- Drop existing policies
drop policy if exists "module_select_policy" on modules;
drop policy if exists "module_insert_policy" on modules;
drop policy if exists "module_update_policy" on modules;
drop policy if exists "module_delete_policy" on modules;

-- Create simplified select policy
create policy "module_select_policy"
  on modules for select
  using (
    visibility = 'public'
    or creator_id = auth.uid()
  );

-- Maintain other operation policies
create policy "module_insert_policy"
  on modules for insert
  with check (creator_id = auth.uid());

create policy "module_update_policy"
  on modules for update
  using (creator_id = auth.uid());

create policy "module_delete_policy"
  on modules for delete
  using (creator_id = auth.uid());