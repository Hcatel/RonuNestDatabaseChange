/*
  # Add profile creation trigger and function

  1. Changes
    - Add function to handle new user creation
    - Add trigger to automatically create profiles when users register
    - Add policy for users to insert their own profile

  2. Security
    - Function runs with security definer to ensure it has necessary permissions
    - RLS policies ensure users can only access their own profile data
*/

-- Create a function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Create a trigger to automatically create profiles
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Add insert policy for profiles
create policy "Users can insert own profile"
  on profiles
  for insert
  to authenticated
  with check (auth.uid() = id);