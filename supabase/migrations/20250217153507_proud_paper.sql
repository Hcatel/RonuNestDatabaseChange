/*
  # Create Core Tables with Auth Integration

  1. New Tables
    - profiles: Linked to auth.users
    - modules: Learning content
    - playlists: Collections of modules
    - playlist_modules: Module ordering in playlists
    - playlist_playlists: Nested playlists
    - groups: Learning groups
    - group_members: Group membership
    - access_control: Content access management
    - comments: Module discussions
    - comment_likes: Comment interactions
    - subscriptions: Creator following

  2. Security
    - RLS enabled on all tables
    - Policies for authenticated access
    - Foreign key constraints
    - Enum types for visibility

  3. Changes
    - UUID primary keys linked to auth.users
    - Timestamps for auditing
    - Proper indexing
*/

-- Create visibility enum type
create type visibility_enum as enum ('draft', 'public', 'restricted');

-- Create profiles table linked to auth.users
create table profiles (
  id uuid primary key references auth.users(id),
  username text unique,
  full_name text,
  role text not null check (role in ('learner', 'creator', 'both')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create modules table
create table modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  thumbnail_url text,
  content jsonb,
  visibility visibility_enum not null default 'draft',
  duration interval,
  views bigint default 0,
  creator_id uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create playlists table
create table playlists (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  thumbnail_url text,
  visibility visibility_enum not null default 'draft',
  creator_id uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create playlist_modules junction table
create table playlist_modules (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid references playlists(id) on delete cascade,
  module_id uuid references modules(id) on delete cascade,
  position int not null,
  created_at timestamptz default now(),
  unique(playlist_id, module_id)
);

-- Create playlist_playlists junction table
create table playlist_playlists (
  id uuid primary key default gen_random_uuid(),
  parent_playlist_id uuid references playlists(id) on delete cascade,
  child_playlist_id uuid references playlists(id) on delete cascade,
  position int not null,
  created_at timestamptz default now(),
  constraint no_self_reference check (parent_playlist_id != child_playlist_id),
  unique(parent_playlist_id, child_playlist_id)
);

-- Create groups table
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  thumbnail_url text,
  creator_id uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create group_members junction table
create table group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  member_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(group_id, member_id)
);

-- Create access_control table
create table access_control (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('module', 'playlist')),
  content_id uuid not null,
  profile_id uuid references profiles(id),
  group_id uuid references groups(id),
  created_at timestamptz default now(),
  check (
    (profile_id is null and group_id is not null) or
    (profile_id is not null and group_id is null)
  )
);

-- Create comments table
create table comments (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references modules(id) on delete cascade,
  creator_id uuid references profiles(id),
  parent_comment_id uuid references comments(id),
  content text not null,
  highlighted boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create comment_likes junction table
create table comment_likes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid references comments(id) on delete cascade,
  profile_id uuid references profiles(id),
  created_at timestamptz default now(),
  unique(comment_id, profile_id)
);

-- Create subscriptions table
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid references profiles(id),
  creator_id uuid references profiles(id),
  created_at timestamptz default now(),
  unique(subscriber_id, creator_id)
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table modules enable row level security;
alter table playlists enable row level security;
alter table playlist_modules enable row level security;
alter table playlist_playlists enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table access_control enable row level security;
alter table comments enable row level security;
alter table comment_likes enable row level security;
alter table subscriptions enable row level security;

-- Create indexes
create index idx_profiles_username on profiles(username);
create index idx_modules_creator on modules(creator_id);
create index idx_playlists_creator on playlists(creator_id);
create index idx_playlist_modules_playlist on playlist_modules(playlist_id);
create index idx_playlist_modules_module on playlist_modules(module_id);
create index idx_playlist_playlists_parent on playlist_playlists(parent_playlist_id);
create index idx_playlist_playlists_child on playlist_playlists(child_playlist_id);
create index idx_groups_creator on groups(creator_id);
create index idx_group_members_group on group_members(group_id);
create index idx_group_members_member on group_members(member_id);
create index idx_comments_module on comments(module_id);
create index idx_comments_creator on comments(creator_id);
create index idx_comment_likes_comment on comment_likes(comment_id);
create index idx_subscriptions_subscriber on subscriptions(subscriber_id);
create index idx_subscriptions_creator on subscriptions(creator_id);

-- Create RLS Policies

-- Profiles policies
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Modules policies
create policy "Anyone can view public modules"
  on modules for select
  using (visibility = 'public');

create policy "Users can view their own modules"
  on modules for select
  using (creator_id = auth.uid());

create policy "Users can create modules"
  on modules for insert
  with check (creator_id = auth.uid());

create policy "Users can update their own modules"
  on modules for update
  using (creator_id = auth.uid());

-- Playlists policies
create policy "Anyone can view public playlists"
  on playlists for select
  using (visibility = 'public');

create policy "Users can view their own playlists"
  on playlists for select
  using (creator_id = auth.uid());

create policy "Users can create playlists"
  on playlists for insert
  with check (creator_id = auth.uid());

create policy "Users can update their own playlists"
  on playlists for update
  using (creator_id = auth.uid());

-- Groups policies
create policy "Users can view groups they belong to"
  on groups for select
  using (
    creator_id = auth.uid() or
    exists (
      select 1 from group_members
      where group_members.group_id = groups.id
      and group_members.member_id = auth.uid()
    )
  );

create policy "Users can create groups"
  on groups for insert
  with check (creator_id = auth.uid());

create policy "Group creators can update their groups"
  on groups for update
  using (creator_id = auth.uid());

-- Comments policies
create policy "Anyone can view comments on public modules"
  on comments for select
  using (
    exists (
      select 1 from modules
      where modules.id = comments.module_id
      and modules.visibility = 'public'
    )
  );

create policy "Users can create comments"
  on comments for insert
  with check (creator_id = auth.uid());

create policy "Users can update their own comments"
  on comments for update
  using (creator_id = auth.uid());

-- Create trigger to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

create trigger update_modules_updated_at
  before update on modules
  for each row
  execute function update_updated_at_column();

create trigger update_playlists_updated_at
  before update on playlists
  for each row
  execute function update_updated_at_column();

create trigger update_groups_updated_at
  before update on groups
  for each row
  execute function update_updated_at_column();

create trigger update_comments_updated_at
  before update on comments
  for each row
  execute function update_updated_at_column();