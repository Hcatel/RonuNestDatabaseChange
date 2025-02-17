/*
  # Add content column to modules table

  1. Changes
    - Add JSONB content column to modules table to store node data
    - Set default empty JSON object
*/

-- Add content column to modules table
alter table modules 
add column if not exists content jsonb default '{}'::jsonb;

-- Add comment to explain column usage
comment on column modules.content is 'Stores module node data and configuration';