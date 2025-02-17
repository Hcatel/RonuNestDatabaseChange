/*
  # Fix modules policy recursion

  1. Changes
    - Drop and recreate the "Users can view public modules" policy with a simpler condition
    - Remove potential recursive conditions

  Note: This fixes the infinite recursion error in the modules policy
*/

-- Drop the existing policy
drop policy if exists "Users can view public modules" on modules;

-- Create a simpler policy for public modules
create policy "Users can view public modules"
  on modules for select
  using (visibility = 'public'::module_visibility);