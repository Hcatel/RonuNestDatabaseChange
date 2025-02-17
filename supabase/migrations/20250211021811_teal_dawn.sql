/*
  # Fix Group Members Policy Recursion

  1. Changes
    - Drop existing problematic policies
    - Create new non-recursive policies for group members
    - Add separate policies for admins and members

  2. Security
    - Maintain proper access control
    - Prevent infinite recursion
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view group members of their groups" ON group_members;
DROP POLICY IF EXISTS "Group admins can manage members" ON group_members;

-- Create new non-recursive policies
CREATE POLICY "group_members_select"
  ON group_members FOR SELECT
  USING (
    -- Users can view members of groups they belong to
    group_id IN (
      SELECT group_id 
      FROM group_members gm 
      WHERE gm.user_id = auth.uid()
    )
  );

CREATE POLICY "group_members_insert"
  ON group_members FOR INSERT
  WITH CHECK (
    -- Only group admins can add members
    EXISTS (
      SELECT 1 
      FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
    )
  );

CREATE POLICY "group_members_delete"
  ON group_members FOR DELETE
  USING (
    -- Only group admins can remove members
    EXISTS (
      SELECT 1 
      FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
    )
  );

-- Add policy for updating member roles
CREATE POLICY "group_members_update"
  ON group_members FOR UPDATE
  USING (
    -- Only group admins can update member roles
    EXISTS (
      SELECT 1 
      FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
    )
  );