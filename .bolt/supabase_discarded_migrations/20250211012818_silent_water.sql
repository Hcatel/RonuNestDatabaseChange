/*
  # Fix playlist module RLS policies

  1. Changes
    - Drop and recreate all playlist module policies
    - Add explicit USING and WITH CHECK clauses
    - Ensure proper ownership checks for all operations
    - Fix position updates

  2. Security
    - Maintains security by checking playlist ownership
    - Allows playlist owners to manage their content
    - Ensures proper access control for all operations
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "playlist_modules_select_policy" ON playlist_modules;
DROP POLICY IF EXISTS "playlist_modules_insert_policy" ON playlist_modules;
DROP POLICY IF EXISTS "playlist_modules_update_policy" ON playlist_modules;
DROP POLICY IF EXISTS "playlist_modules_delete_policy" ON playlist_modules;

-- Create new comprehensive policies with both USING and WITH CHECK clauses
CREATE POLICY "playlist_modules_select"
  ON playlist_modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_id
      AND (visibility = 'public' OR creator_id = auth.uid())
    )
  );

CREATE POLICY "playlist_modules_insert"
  ON playlist_modules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_id
      AND creator_id = auth.uid()
    )
  );

CREATE POLICY "playlist_modules_update"
  ON playlist_modules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_id
      AND creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_id
      AND creator_id = auth.uid()
    )
  );

CREATE POLICY "playlist_modules_delete"
  ON playlist_modules FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_id
      AND creator_id = auth.uid()
    )
  );

-- Add trigger to maintain position ordering
CREATE OR REPLACE FUNCTION maintain_playlist_module_positions()
RETURNS TRIGGER AS $$
BEGIN
  -- When a module is deleted, shift positions down
  IF TG_OP = 'DELETE' THEN
    UPDATE playlist_modules
    SET position = position - 1
    WHERE playlist_id = OLD.playlist_id
    AND position > OLD.position;
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for position maintenance
DROP TRIGGER IF EXISTS playlist_module_position_maintenance ON playlist_modules;
CREATE TRIGGER playlist_module_position_maintenance
  AFTER DELETE ON playlist_modules
  FOR EACH ROW
  EXECUTE FUNCTION maintain_playlist_module_positions();