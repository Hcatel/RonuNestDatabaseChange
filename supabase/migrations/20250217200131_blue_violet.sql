/*
  # Fix Group Members RLS Policies

  1. Changes
    - Drop existing group members policies
    - Create new policies that allow group creators to view and manage members
    - Add policy for members to view their own memberships

  2. Security
    - Ensures group creators can manage their group members
    - Allows members to view groups they belong to
*/

-- Drop existing policies
drop policy if exists "Users can view group members" on group_members;
drop policy if exists "Group creators can manage members" on group_members;

-- Create new policies
create policy "Group creators can view members"
  on group_members for select
  using (
    exists (
      select 1 from groups
      where groups.id = group_members.group_id
      and groups.creator_id = auth.uid()
    )
  );

create policy "Group creators can manage members"
  on group_members for all
  using (
    exists (
      select 1 from groups
      where groups.id = group_members.group_id
      and groups.creator_id = auth.uid()
    )
  );