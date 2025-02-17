/*
  # Remove old connections array from modules table

  1. Changes
    - Remove the deprecated connections array from the content JSONB column
    - Update existing module content to use the new connection format
    
  2. Notes
    - This is a non-destructive migration that preserves all existing connection data
    - Connections are now stored in either:
      a) The single 'connection' field for regular nodes
      b) The 'connection' field within each choice for router nodes
*/

DO $$ 
DECLARE
  module_record RECORD;
  updated_content jsonb;
  node_array jsonb;
  i integer;
  node jsonb;
  updated_node jsonb;
  choices jsonb;
  updated_choices jsonb;
  choice jsonb;
  j integer;
BEGIN
  -- Iterate through all modules
  FOR module_record IN SELECT id, content FROM modules WHERE content ? 'nodes'
  LOOP
    -- Get the nodes array
    node_array := module_record.content->'nodes';
    updated_content := module_record.content;
    
    -- Initialize empty array for updated nodes
    updated_content := jsonb_set(updated_content, '{nodes}', '[]'::jsonb);
    
    -- Process each node
    FOR i IN 0..jsonb_array_length(node_array) - 1 LOOP
      node := node_array->i;
      updated_node := node;
      
      -- Handle router nodes
      IF (node->>'type') = 'router' THEN
        IF node ? 'connections' AND node ? 'config' AND node->'config' ? 'choices' THEN
          choices := node->'config'->'choices';
          updated_choices := '[]'::jsonb;
          
          -- Update each choice with its connection
          FOR j IN 0..jsonb_array_length(choices) - 1 LOOP
            choice := choices->j;
            -- If there's a connection available for this choice, add it
            IF j < jsonb_array_length(node->'connections') THEN
              choice := jsonb_set(
                choice,
                '{connection}',
                node->'connections'->j
              );
            END IF;
            updated_choices := updated_choices || choice;
          END LOOP;
          
          -- Update the node's choices
          updated_node := jsonb_set(
            updated_node,
            '{config,choices}',
            updated_choices
          );
        END IF;
      -- Handle regular nodes
      ELSIF node ? 'connections' AND jsonb_array_length(node->'connections') > 0 THEN
        -- Set single connection from first element of connections array
        updated_node := jsonb_set(
          updated_node,
          '{connection}',
          node->'connections'->0
        );
      END IF;
      
      -- Remove the old connections array
      updated_node := updated_node - 'connections';
      
      -- Add the updated node to the array
      updated_content := jsonb_set(
        updated_content,
        '{nodes}',
        (updated_content->'nodes') || updated_node
      );
    END LOOP;

    -- Update the module
    UPDATE modules 
    SET content = updated_content,
        updated_at = now()
    WHERE id = module_record.id;
  END LOOP;
END $$;