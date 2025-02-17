/*
  # Groups Management Schema

  1. New Tables
    - `groups`
      - Core group information
      - Group size tracking
      - Timestamps
    - `group_members`
      - Tracks group membership
      - Links users to groups
    - `group_playlists`
      - Tracks playlist access for groups
      - Links groups to playlists

  2. Security
    - Enable RLS on all tables
    - Policies for:
      - Group creation and management
      - Group membership
      - Playlist access
*/

-- Groups table
create table groups (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references auth.users(id) not null,
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Group members junction table
create table group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('admin', 'member')),
  created_at timestamptz default now(),
  unique(group_id, user_id)
);

-- Group playlists junction table
create table group_playlists (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade not null,
  playlist_id uuid references playlists(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(group_id, playlist_id)
);

-- Enable Row Level Security
alter table groups enable row level security;
alter table group_members enable row level security;
alter table group_playlists enable row level security;

-- Groups policies
create policy "Users can view groups they are members of"
  on groups for select
  using (
    exists (
      select 1 from group_members
      where group_id = groups.id
      and user_id = auth.uid()
    )
  );

create policy "Users can create groups"
  on groups for insert
  with check (creator_id = auth.uid());

create policy "Group admins can update groups"
  on groups for update
  using (
    exists (
      select 1 from group_members
      where group_id = groups.id
      and user_id = auth.uid()
      and role = 'admin'
    )
  );

create policy "Group admins can delete groups"
  on groups for delete
  using (
    exists (
      select 1 from group_members
      where group_id = groups.id
      and user_id = auth.uid()
      and role = 'admin'
    )
  );

-- Group members policies
create policy "Users can view group members of their groups"
  on group_members for select
  using (
    exists (
      select 1 from group_members gm
      where gm.group_id = group_members.group_id
      and gm.user_id = auth.uid()
    )
  );

create policy "Group admins can manage members"
  on group_members
  using (
    exists (
      select 1 from group_members
      where group_id = group_members.group_id
      and user_id = auth.uid()
      and role = 'admin'
    )
  );

-- Group playlists policies
create policy "Users can view group playlists of their groups"
  on group_playlists for select
  using (
    exists (
      select 1 from group_members
      where group_id = group_playlists.group_id
      and user_id = auth.uid()
    )
  );

create policy "Group admins can manage playlists"
  on group_playlists
  using (
    exists (
      select 1 from group_members
      where group_id = group_playlists.group_id
      and user_id = auth.uid()
      and role = 'admin'
    )
  );

-- Function to automatically add creator as admin
create or replace function public.handle_new_group()
returns trigger as $$
begin
  insert into group_members (group_id, user_id, role)
  values (new.id, new.creator_id, 'admin');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to add creator as admin
create trigger on_group_created
  after insert on groups
  for each row execute function public.handle_new_group();

-- Update timestamp trigger
create trigger update_groups_updated_at
  before update on groups
  for each row execute function update_updated_at();