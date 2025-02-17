/*
  # Fix modules policy recursion

  1. Changes
    - Drop existing policy that causes recursion
    - Create new simplified policy for module access
    - Ensure no circular references in policy conditions
  
  2. Security
    - Maintains same access control rules
    - Simplifies policy logic while preserving security
*/

-- Drop the problematic policy
drop policy if exists "Module access policy" on modules;

-- Create new simplified policy
create policy "Module view policy"
  on modules for select
  using (
    case
      when visibility = 'public'::module_visibility then true
      when auth.uid() = creator_id then true
      when visibility = 'restricted'::module_visibility and exists (
        select 1
        from module_access
        where module_access.module_id = modules.id
        and module_access.user_id = auth.uid()
      ) then true
      else false
    end
  );