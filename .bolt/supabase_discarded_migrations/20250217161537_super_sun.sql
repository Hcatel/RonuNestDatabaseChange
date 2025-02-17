/*
  # Fix Group Members Structure

  1. Changes
    - Drop existing group_members table
    - Create new group_members table with correct structure
    - Add necessary indexes and constraints
    - Add RLS policies for group access

  2. Security
    - Enable RLS
    - Add policies for group member management
*/

-- Drop existing group_members table
drop table if exists group_members;

-- Create new group_members table with correct structure
create table group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  learner_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('member', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  -- Ensure a learner can only be in a group once
  unique(group_id, learner_id)
);

-- Enable RLS
alter table group_members enable row level security;

-- Create indexes
create index idx_group_members_group_id on group_members(group_id);
create index idx_group_members_learner_id on group_members(learner_id);

-- Create RLS policies
create policy "Group creators can manage members"
  on group_members for all
  using (
    exists (
      select 1 from groups
      where groups.id = group_members.group_id
      and groups.creator_id = auth.uid()
    )
  );

create policy "Group admins can manage members"
  on group_members for all
  using (
    exists (
      select 1 from group_members gm
      where gm.group_id = group_members.group_id
      and gm.learner_id = auth.uid()
      and gm.role = 'admin'
    )
  );

create policy "Members can view their own memberships"
  on group_members for select
  using (learner_id = auth.uid());

-- Create trigger for updated_at
create trigger update_group_members_updated_at
  before update on group_members
  for each row
  execute function update_updated_at_column();

-- Add group creator as admin member
create or replace function add_creator_as_admin()
returns trigger as $$
begin
  insert into group_members (group_id, learner_id, role)
  values (new.id, new.creator_id, 'admin');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_group_created
  after insert on groups
  for each row
  execute procedure add_creator_as_admin();