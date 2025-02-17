/*
  # Update Groups Schema

  1. Changes
    - Add missing columns to groups table
    - Create group_content table for content associations
    - Add RLS policies for content access

  2. Security
    - Enable RLS on new tables
    - Add policies for content access control
*/

-- Add missing columns to groups table
ALTER TABLE groups
ADD COLUMN IF NOT EXISTS thumbnail_url text;

-- Create group_content table
CREATE TABLE IF NOT EXISTS group_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('module', 'playlist')),
  content_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(group_id, content_type, content_id)
);

-- Enable RLS
ALTER TABLE group_content ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for group_content
CREATE POLICY "group_content_select_policy"
  ON group_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_content.group_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "group_content_insert_policy"
  ON group_content FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_content.group_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "group_content_delete_policy"
  ON group_content FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_content.group_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Add trigger to update timestamps
CREATE TRIGGER update_group_content_updated_at
  BEFORE UPDATE ON group_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();