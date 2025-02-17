/*
  # Add Module Analytics Table

  1. New Tables
    - `module_analytics` - Stores analytics data for modules
      - `id` (uuid, primary key)
      - `module_id` (uuid, references modules)
      - `creator_id` (uuid, references auth.users)
      - `views` (integer)
      - `module_time` (integer) - Time spent in minutes
      - `revenue` (decimal)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `module_analytics` table
    - Add policies for creators to manage their analytics
*/

-- Create module analytics table
CREATE TABLE IF NOT EXISTS module_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  views integer DEFAULT 0,
  module_time integer DEFAULT 0,
  revenue decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT positive_views CHECK (views >= 0),
  CONSTRAINT positive_time CHECK (module_time >= 0),
  CONSTRAINT positive_revenue CHECK (revenue >= 0)
);

-- Enable RLS
ALTER TABLE module_analytics ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Creators can view their analytics"
  ON module_analytics FOR SELECT
  USING (creator_id = auth.uid());

CREATE POLICY "Creators can insert analytics"
  ON module_analytics FOR INSERT
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can update their analytics"
  ON module_analytics FOR UPDATE
  USING (creator_id = auth.uid());

-- Add indexes for performance
CREATE INDEX module_analytics_creator_id_idx ON module_analytics(creator_id);
CREATE INDEX module_analytics_module_id_idx ON module_analytics(module_id);
CREATE INDEX module_analytics_created_at_idx ON module_analytics(created_at);