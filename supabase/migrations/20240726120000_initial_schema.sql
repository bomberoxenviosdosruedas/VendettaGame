
-- Create a table for public user profiles
create table profiles (
  id uuid not null references auth.users on delete cascade,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  primary key (id),
  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security
alter table profiles
  enable row level security;

create policy "Los perfiles públicos son visibles para todos." on profiles
  for select using (true);

create policy "Los usuarios pueden insertar sus propios perfiles." on profiles
  for insert with check ((select auth.uid()) = id);

create policy "Los usuarios pueden actualizar sus propios perfiles." on profiles
  for update using ((select auth.uid()) = id);

-- This trigger automatically creates a profile entry when a new user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Set up Storage!
insert into storage.buckets (id, name)
  values ('avatars', 'avatars');

-- Set up access controls for storage.
-- See https://supabase.com/docs/guides/storage#policy-examples
create policy "Las imágenes de avatar son públicamente accesibles." on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Cualquiera puede subir un avatar." on storage.objects
  for insert with check (bucket_id = 'avatars');
