/*
  # Add automatic profile creation trigger

  1. New Functions
    - `handle_new_user`: Creates a profile record when a new user signs up

  2. Triggers
    - `on_auth_user_created`: Executes after a new user is created
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
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();