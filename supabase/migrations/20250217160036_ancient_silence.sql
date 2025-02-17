/*
  # Fix Profile Creation and Foreign Key Constraints

  1. Changes
    - Add trigger to auto-create profiles when users sign up
    - Add policy for profile creation
    - Ensure profiles are created with default role
  
  2. Details
    - Creates profiles automatically on user signup
    - Sets default role to 'learner'
    - Maintains referential integrity
*/

-- Create trigger function to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, role)
  values (
    new.id,
    new.email,
    'learner'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to auto-create profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Add policy for profile creation via trigger
create policy "Trigger can create profiles"
  on profiles for insert
  with check (true);

-- Add policy for public profile viewing
create policy "Profiles are viewable by everyone"
  on profiles for select
  using (true);

-- Ensure existing users have profiles
insert into public.profiles (id, username, role)
select 
  id,
  email,
  'learner'
from auth.users
where not exists (
  select 1 from profiles where profiles.id = auth.users.id
);