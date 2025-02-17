-- Show all tables and their columns
select 
    t.table_schema,
    t.table_name,
    c.column_name,
    c.data_type,
    c.column_default,
    c.is_nullable,
    c.character_maximum_length,
    c.numeric_precision,
    c.numeric_scale
from information_schema.tables t
join information_schema.columns c 
    on t.table_name = c.table_name 
    and t.table_schema = c.table_schema
where t.table_schema = 'public'
order by t.table_name, c.ordinal_position;

-- Show all policies
select 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- Show all enums
select 
    t.typname as enum_name,
    e.enumlabel as enum_value
from pg_type t
join pg_enum e on t.oid = e.enumtypid
join pg_catalog.pg_namespace n on n.oid = t.typnamespace
where n.nspname = 'public'
order by t.typname, e.enumsortorder;

-- Show all triggers
select 
    trigger_name,
    event_manipulation,
    event_object_schema,
    event_object_table,
    action_statement,
    action_timing
from information_schema.triggers
where trigger_schema = 'public'
order by event_object_table, trigger_name;

-- Show all functions
select 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
from pg_proc p
join pg_namespace n on p.pronamespace = n.oid
where n.nspname = 'public'
order by p.proname;