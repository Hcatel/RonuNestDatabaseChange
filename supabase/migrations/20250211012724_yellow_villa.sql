/*
  # Fix playlist module policies

  1. Changes
    - Drop and recreate all playlist module policies
    - Add explicit policies for all operations
    - Ensure proper ownership checks
    - Fix position updates

  2. Security
    - Maintains security by checking playlist ownership
    - Allows playlist owners to manage their content
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view playlist modules" ON playlist_modules;
DROP POLICY IF EXISTS "Users can add modules to their playlists" ON playlist_modules;
DROP POLICY IF EXISTS "Users can update modules in their playlists" ON playlist_modules;
DROP POLICY IF EXISTS "Users can remove modules from their playlists" ON playlist_modules;

-- Create new comprehensive policies
CREATE POLICY "playlist_modules_select_policy"
  ON playlist_modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_id
      AND (visibility = 'public' OR creator_id = auth.uid())
    )
  );

CREATE POLICY "playlist_modules_insert_policy"
  ON playlist_modules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_id
      AND creator_id = auth.uid()
    )
  );

CREATE POLICY "playlist_modules_update_policy"
  ON playlist_modules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_modules.playlist_id
      AND creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_modules.playlist_id
      AND creator_id = auth.uid()
    )
  );

CREATE POLICY "playlist_modules_delete_policy"
  ON playlist_modules FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_modules.playlist_id
      AND creator_id = auth.uid()
    )
  );