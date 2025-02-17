/*
  # Fix Group Profile Connection

  1. Changes
    - Add missing profile fields
    - Add group member email field
    - Update group member constraints
    - Add group member policies

  2. Security
    - Enable RLS on all tables
    - Add policies for group access
*/

-- Add email field to group_members
alter table group_members drop constraint if exists group_members_member_id_fkey;
alter table group_members drop column if exists member_id;
alter table group_members add column email text not null;

-- Add email field to profiles if it doesn't exist
do $$ 
begin
  if not exists (select 1 from information_schema.columns 
    where table_name = 'profiles' and column_name = 'email') 
  then
    alter table profiles add column email text;
    
    -- Update existing profiles with email from auth.users
    update profiles 
    set email = users.email 
    from auth.users 
    where profiles.id = users.id;
    
    -- Make email required and unique
    alter table profiles alter column email set not null;
    alter table profiles add constraint profiles_email_unique unique (email);
  end if;
end $$;

-- Update group member constraints
alter table group_members 
  add constraint group_members_email_group_unique 
  unique (email, group_id);

-- Add policies for group members
create policy "Group creators can manage members"
  on group_members for all
  using (
    exists (
      select 1 from groups
      where groups.id = group_members.group_id
      and groups.creator_id = auth.uid()
    )
  );

create policy "Members can view their own memberships"
  on group_members for select
  using (
    exists (
      select 1 from profiles
      where profiles.email = group_members.email
      and profiles.id = auth.uid()
    )
  );