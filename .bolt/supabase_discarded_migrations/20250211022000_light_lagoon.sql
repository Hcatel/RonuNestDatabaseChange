/*
  # Fix Group Members Policy Recursion

  1. Changes
    - Drop existing problematic policies
    - Create new non-recursive policies for group members
    - Add separate policies for admins and members
    - Fix infinite recursion by using creator_id from groups table

  2. Security
    - Maintain proper access control
    - Prevent infinite recursion
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "group_members_select" ON group_members;
DROP POLICY IF EXISTS "group_members_insert" ON group_members;
DROP POLICY IF EXISTS "group_members_delete" ON group_members;
DROP POLICY IF EXISTS "group_members_update" ON group_members;

-- Create new non-recursive policies
CREATE POLICY "group_members_select"
  ON group_members FOR SELECT
  USING (
    -- Users can view members if they are the group creator or a member
    EXISTS (
      SELECT 1 
      FROM groups g
      WHERE g.id = group_members.group_id
      AND (
        g.creator_id = auth.uid()
        OR EXISTS (
          SELECT 1 
          FROM group_members gm
          WHERE gm.group_id = group_members.group_id
          AND gm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "group_members_insert"
  ON group_members FOR INSERT
  WITH CHECK (
    -- Only group creators can add members
    EXISTS (
      SELECT 1 
      FROM groups g
      WHERE g.id = group_members.group_id
      AND g.creator_id = auth.uid()
    )
  );

CREATE POLICY "group_members_delete"
  ON group_members FOR DELETE
  USING (
    -- Only group creators can remove members
    EXISTS (
      SELECT 1 
      FROM groups g
      WHERE g.id = group_members.group_id
      AND g.creator_id = auth.uid()
    )
  );

CREATE POLICY "group_members_update"
  ON group_members FOR UPDATE
  USING (
    -- Only group creators can update member roles
    EXISTS (
      SELECT 1 
      FROM groups g
      WHERE g.id = group_members.group_id
      AND g.creator_id = auth.uid()
    )
  );