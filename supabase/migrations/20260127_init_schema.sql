-- Enable required extensions
create extension if not exists "pgcrypto";

-- ============================================================================
-- Functions
-- ============================================================================

-- 1. Generic updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

-- 2. Handle new auth user -> create profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      nullif(split_part(new.email, '@', 1), ''),
      'user_' || substr(new.id::text, 1, 8)
    )
  )
  on conflict (id) do nothing;

  -- Also create default user_settings row
  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Attach trigger to auth.users
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ============================================================================
-- Tables
-- ============================================================================

-- 1. profiles (public)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  bio text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
on public.profiles
for select
using (true);

create policy "Users can insert their own profile"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can delete their own profile"
on public.profiles
for delete
using (auth.uid() = id);

create index if not exists idx_profiles_username
on public.profiles (username);

create trigger set_timestamp_profiles
before update on public.profiles
for each row
execute function public.update_updated_at_column();

-- 2. parks (public)
create table if not exists public.parks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  description text,
  state text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.parks enable row level security;

create policy "Parks are viewable by everyone"
on public.parks
for select
using (true);

-- Restrict writes to service role (for seeding/administration)
create policy "Only service role can modify parks"
on public.parks
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create index if not exists idx_parks_name
on public.parks (name);

create index if not exists idx_parks_lat_lng
on public.parks (latitude, longitude);

-- Seed data: Indian national parks (approximate coordinates)
insert into public.parks (name, latitude, longitude, description, state)
values
  ('Jim Corbett National Park', 29.5300, 78.7747, 'Oldest national park in India, known for Bengal tigers.', 'Uttarakhand'),
  ('Kaziranga National Park', 26.5775, 93.1711, 'UNESCO World Heritage Site famous for one-horned rhinoceros.', 'Assam'),
  ('Ranthambore National Park', 26.0173, 76.5026, 'Historic fort and prime tiger reserve.', 'Rajasthan'),
  ('Bandhavgarh National Park', 23.6850, 81.0010, 'High density of tigers and rich biodiversity.', 'Madhya Pradesh'),
  ('Kanha National Park', 22.3345, 80.6115, 'Inspiration for Kipling’s Jungle Book, known for barasingha.', 'Madhya Pradesh'),
  ('Gir National Park', 21.1240, 70.8242, 'Only natural habitat of Asiatic lions.', 'Gujarat'),
  ('Sundarbans National Park', 21.9497, 88.8910, 'Mangrove forest and Royal Bengal tigers.', 'West Bengal'),
  ('Periyar National Park', 9.4620, 77.2360, 'Scenic lake and elephant reserve in the Western Ghats.', 'Kerala'),
  ('Bandipur National Park', 11.6546, 76.6295, 'Part of Nilgiri Biosphere Reserve, rich in elephants and tigers.', 'Karnataka'),
  ('Nagarhole National Park', 12.0154, 76.1527, 'Dense forests and abundant wildlife, adjacent to Bandipur.', 'Karnataka'),
  ('Pench National Park', 21.7080, 79.2934, 'Straddles Madhya Pradesh and Maharashtra, diverse fauna.', 'Madhya Pradesh'),
  ('Sanjay Gandhi National Park', 19.2147, 72.9106, 'Urban national park inside Mumbai metropolitan area.', 'Maharashtra'),
  ('Hemis National Park', 33.9080, 77.5870, 'High-altitude park famous for snow leopards.', 'Ladakh'),
  ('Valley of Flowers National Park', 30.7280, 79.6050, 'Alpine meadows and endemic flora, UNESCO site.', 'Uttarakhand'),
  ('Great Himalayan National Park', 31.7754, 77.4730, 'Himalayan ecosystems and diverse endemic species.', 'Himachal Pradesh'),
  ('Keoladeo National Park', 27.1591, 77.5236, 'Bird sanctuary and UNESCO World Heritage Site.', 'Rajasthan'),
  ('Manas National Park', 26.6570, 91.0010, 'Tiger reserve and biosphere reserve on Bhutan border.', 'Assam'),
  ('Mudumalai National Park', 11.5980, 76.5330, 'Part of Nilgiri Biosphere, known for elephants and big cats.', 'Tamil Nadu'),
  ('Dudhwa National Park', 28.5820, 80.5710, 'Terai ecosystem with swamp deer and tigers.', 'Uttar Pradesh'),
  ('Desert National Park', 26.9180, 70.7790, 'Thar desert ecosystem and habitat of great Indian bustard.', 'Rajasthan')
on conflict do nothing;

-- 3. posts (public)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  image_url text not null,
  park_id uuid references public.parks (id),
  park_name text not null,
  latitude double precision not null,
  longitude double precision not null,
  caption text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.posts enable row level security;

create policy "Posts are viewable by everyone"
on public.posts
for select
using (true);

create policy "Users can create posts"
on public.posts
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own posts"
on public.posts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own posts"
on public.posts
for delete
using (auth.uid() = user_id);

create index if not exists idx_posts_user_id
on public.posts (user_id);

create index if not exists idx_posts_park_id
on public.posts (park_id);

create index if not exists idx_posts_created_at_desc
on public.posts (created_at desc);

create index if not exists idx_posts_lat_lng
on public.posts (latitude, longitude);

create trigger set_timestamp_posts
before update on public.posts
for each row
execute function public.update_updated_at_column();

-- 4. likes (public)
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint likes_user_post_unique unique (user_id, post_id)
);

alter table public.likes enable row level security;

create policy "Likes are viewable by everyone"
on public.likes
for select
using (true);

create policy "Users can like posts"
on public.likes
for insert
with check (auth.uid() = user_id);

create policy "Users can remove their own likes"
on public.likes
for delete
using (auth.uid() = user_id);

create index if not exists idx_likes_post_id
on public.likes (post_id);

create index if not exists idx_likes_user_id
on public.likes (user_id);

-- 5. comments (public)
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  parent_comment_id uuid references public.comments (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
on public.comments
for select
using (true);

create policy "Users can create comments"
on public.comments
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own comments"
on public.comments
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
on public.comments
for delete
using (auth.uid() = user_id);

create index if not exists idx_comments_post_id
on public.comments (post_id);

create index if not exists idx_comments_parent_comment_id
on public.comments (parent_comment_id);

create index if not exists idx_comments_created_at
on public.comments (created_at);

create trigger set_timestamp_comments
before update on public.comments
for each row
execute function public.update_updated_at_column();

-- 6. user_settings (public)
create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  notifications_enabled boolean not null default true,
  email_notifications boolean not null default true,
  push_notifications boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.user_settings enable row level security;

create policy "Users can read their own settings"
on public.user_settings
for select
using (auth.uid() = user_id);

create policy "Users can insert their own settings"
on public.user_settings
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own settings"
on public.user_settings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own settings"
on public.user_settings
for delete
using (auth.uid() = user_id);

create unique index if not exists idx_user_settings_user_id
on public.user_settings (user_id);

create trigger set_timestamp_user_settings
before update on public.user_settings
for each row
execute function public.update_updated_at_column();

-- 7. saved_parks (public) - stretch goal
create table if not exists public.saved_parks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  park_id uuid not null references public.parks (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint saved_parks_user_park_unique unique (user_id, park_id)
);

alter table public.saved_parks enable row level security;

create policy "Users can view their own saved parks"
on public.saved_parks
for select
using (auth.uid() = user_id);

create policy "Users can save parks for themselves"
on public.saved_parks
for insert
with check (auth.uid() = user_id);

create policy "Users can remove their own saved parks"
on public.saved_parks
for delete
using (auth.uid() = user_id);

create index if not exists idx_saved_parks_user_id
on public.saved_parks (user_id);

-- 8. post_tags (public) - stretch goal
create table if not exists public.post_tags (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  tag text not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.post_tags enable row level security;

create policy "Post tags are viewable by everyone"
on public.post_tags
for select
using (true);

create policy "Users can tag their own posts"
on public.post_tags
for insert
with check (
  exists (
    select 1
    from public.posts
    where posts.id = post_id
      and posts.user_id = auth.uid()
  )
);

create policy "Users can remove tags from their own posts"
on public.post_tags
for delete
using (
  exists (
    select 1
    from public.posts
    where posts.id = post_id
      and posts.user_id = auth.uid()
  )
);

create index if not exists idx_post_tags_post_id
on public.post_tags (post_id);

create index if not exists idx_post_tags_tag
on public.post_tags (tag);

-- ============================================================================
-- Storage buckets & policies
-- ============================================================================

-- Create buckets if they don't already exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- Avatars: public read, owners manage their files
create policy "Public read access for avatars"
on storage.objects
for select
using (bucket_id = 'avatars');

create policy "Users can upload their own avatars"
on storage.objects
for insert
with check (
  bucket_id = 'avatars'
  and auth.role() = 'authenticated'
  and auth.uid() = owner
);

create policy "Users can update their own avatars"
on storage.objects
for update
using (
  bucket_id = 'avatars'
  and auth.uid() = owner
)
with check (
  bucket_id = 'avatars'
  and auth.uid() = owner
);

create policy "Users can delete their own avatars"
on storage.objects
for delete
using (
  bucket_id = 'avatars'
  and auth.uid() = owner
);

-- Post images: public read, owners manage their files
create policy "Public read access for post images"
on storage.objects
for select
using (bucket_id = 'post-images');

create policy "Users can upload post images"
on storage.objects
for insert
with check (
  bucket_id = 'post-images'
  and auth.role() = 'authenticated'
  and auth.uid() = owner
);

create policy "Users can update their own post images"
on storage.objects
for update
using (
  bucket_id = 'post-images'
  and auth.uid() = owner
)
with check (
  bucket_id = 'post-images'
  and auth.uid() = owner
);

create policy "Users can delete their own post images"
on storage.objects
for delete
using (
  bucket_id = 'post-images'
  and auth.uid() = owner
);

