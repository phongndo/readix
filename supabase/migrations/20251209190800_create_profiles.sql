-- Create profiles table
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
-- Enable RLS
alter table public.profiles enable row level security;
-- Users can read their own profile
create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);
-- Users can update their own profile
create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);
-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    new.raw_user_meta_data->>'firstName',
    new.raw_user_meta_data->>'lastName'
  );
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
