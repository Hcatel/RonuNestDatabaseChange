/*
  # Update playlist module policies

  1. Changes
    - Simplify playlist module policies to allow proper management
    - Add explicit policies for insert, update, and delete operations
    - Ensure policies check for playlist ownership

  2. Security
    - Maintains security by checking playlist ownership
    - Allows playlist owners to manage their playlist content
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can manage modules in their playlists" ON playlist_modules;

-- Create separate policies for different operations
CREATE POLICY "Users can view playlist modules"
  ON playlist_modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_modules.playlist_id
      AND (visibility = 'public' OR creator_id = auth.uid())
    )
  );

CREATE POLICY "Users can add modules to their playlists"
  ON playlist_modules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_id
      AND creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can update modules in their playlists"
  ON playlist_modules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_id
      AND creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove modules from their playlists"
  ON playlist_modules FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_id
      AND creator_id = auth.uid()
    )
  );