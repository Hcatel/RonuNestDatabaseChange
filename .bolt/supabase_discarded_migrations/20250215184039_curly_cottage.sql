/*
  # Add test group

  1. New Data
    - Creates a test group in the groups table
    - Adds initial admin member to the group
  
  2. Security
    - Uses RLS policies already in place
    - Ensures creator is automatically added as admin
*/

-- Insert a new group
INSERT INTO groups (
  name,
  description,
  creator_id,
  thumbnail_url
) VALUES (
  'Web Development Cohort',
  'A collaborative learning group for web development enthusiasts',
  auth.uid(),
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f'
);

-- Note: The group_members entry for the creator will be automatically added
-- by the handle_new_group trigger we created earlier