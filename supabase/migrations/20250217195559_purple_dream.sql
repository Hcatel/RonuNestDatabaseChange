/*
  # Add Group RLS Policies

  1. New Policies
    - Groups table policies for viewing, creating, and updating
    - Group members table policies for viewing and managing members

  2. Security
    - Ensures users can only view and manage their own groups
    - Group creators can manage their group members
*/

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

create policy "Group creators can delete their groups"
  on groups for delete
  using (creator_id = auth.uid());

-- Group members policies
create policy "Users can view group members"
  on group_members for select
  using (
    exists (
      select 1 from groups
      where groups.id = group_members.group_id
      and (
        groups.creator_id = auth.uid() or
        exists (
          select 1 from group_members gm
          where gm.group_id = groups.id
          and gm.member_id = auth.uid()
        )
      )
    )
  );

create policy "Group creators can manage members"
  on group_members for all
  using (
    exists (
      select 1 from groups
      where groups.id = group_members.group_id
      and groups.creator_id = auth.uid()
    )
  );