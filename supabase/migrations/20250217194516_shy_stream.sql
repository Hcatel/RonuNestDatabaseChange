/*
  # Drop Group Policies

  1. Changes
    - Drop all group-related RLS policies
    - Affects groups and group_members tables
    - Maintains table structure but removes access controls

  2. Impact
    - Groups and group members tables will no longer have RLS policies
    - Tables and data remain intact
    - Access control must be handled at application level until new policies are created
*/

-- Drop group policies
drop policy if exists "Users can view groups they belong to" on groups;
drop policy if exists "Users can create groups" on groups;
drop policy if exists "Group creators can update their groups" on groups;

-- Drop group members policies
drop policy if exists "Users can view their own group memberships" on group_members;
drop policy if exists "Users can join groups" on group_members;
drop policy if exists "Group creators can manage members" on group_members;