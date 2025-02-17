/*
  # Fix module access policies

  1. Changes
    - Drop all existing module policies
    - Create a single combined policy for viewing modules
    - Simplify policy logic to prevent recursion

  This migration fixes the infinite recursion issue by combining all access checks into a single policy
  with clear OR conditions.
*/

-- Drop all existing module policies to start fresh
drop policy if exists "Users can view public modules" on modules;
drop policy if exists "Users can view restricted modules they have access to" on modules;
drop policy if exists "Users can view their own modules" on modules;

-- Create a single combined policy for viewing modules
create policy "Module access policy"
  on modules for select
  using (
    visibility = 'public'::module_visibility
    or creator_id = auth.uid()
    or (
      visibility = 'restricted'::module_visibility
      and exists (
        select 1
        from module_access
        where module_access.module_id = id
        and module_access.user_id = auth.uid()
      )
    )
  );