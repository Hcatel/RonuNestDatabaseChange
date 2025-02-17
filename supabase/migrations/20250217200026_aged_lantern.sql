/*
  # Update Group RLS Policies

  1. Changes
    - Modify groups select policy to only show groups where user is creator
    - Keep other policies unchanged

  2. Security
    - Ensures users can only view groups they created
    - Maintains existing security for group management
*/

-- Drop existing select policy
drop policy if exists "Users can view groups they belong to" on groups;

-- Create new select policy that only shows groups user created
create policy "Users can view groups they created"
  on groups for select
  using (creator_id = auth.uid());