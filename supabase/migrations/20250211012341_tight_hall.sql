/*
  # Add Playlist Nesting Support

  1. New Tables
    - `playlist_playlists`
      - `id` (uuid, primary key)
      - `parent_playlist_id` (uuid, references playlists)
      - `child_playlist_id` (uuid, references playlists)
      - `position` (integer)
      - `created_at` (timestamptz)

  2. Changes
    - Add table for playlist nesting relationships
    - Add RLS policies for playlist nesting
    - Add constraints to prevent circular references

  3. Security
    - Enable RLS on new table
    - Add policies for authenticated users
*/

-- Create playlist nesting table
CREATE TABLE IF NOT EXISTS playlist_playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_playlist_id uuid REFERENCES playlists(id) ON DELETE CASCADE,
  child_playlist_id uuid REFERENCES playlists(id) ON DELETE CASCADE,
  position integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT playlist_playlists_no_self_reference CHECK (parent_playlist_id != child_playlist_id),
  UNIQUE(parent_playlist_id, child_playlist_id),
  UNIQUE(parent_playlist_id, position)
);

-- Enable RLS
ALTER TABLE playlist_playlists ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view playlist relationships they have access to"
  ON playlist_playlists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_playlists.parent_playlist_id
      AND (
        visibility = 'public'
        OR creator_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage playlist relationships they own"
  ON playlist_playlists
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_playlists.parent_playlist_id
      AND creator_id = auth.uid()
    )
  );

-- Function to prevent circular references
CREATE OR REPLACE FUNCTION check_playlist_circular_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    WITH RECURSIVE playlist_tree AS (
      -- Base case: direct children
      SELECT child_playlist_id, 1 AS level
      FROM playlist_playlists
      WHERE parent_playlist_id = NEW.child_playlist_id
      
      UNION ALL
      
      -- Recursive case: children of children
      SELECT pp.child_playlist_id, pt.level + 1
      FROM playlist_playlists pp
      INNER JOIN playlist_tree pt ON pp.parent_playlist_id = pt.child_playlist_id
      WHERE level < 100 -- Prevent infinite recursion
    )
    SELECT 1 FROM playlist_tree WHERE child_playlist_id = NEW.parent_playlist_id
  ) THEN
    RAISE EXCEPTION 'Circular reference detected in playlist hierarchy';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to prevent circular references
CREATE TRIGGER prevent_playlist_circular_reference
  BEFORE INSERT OR UPDATE ON playlist_playlists
  FOR EACH ROW
  EXECUTE FUNCTION check_playlist_circular_reference();