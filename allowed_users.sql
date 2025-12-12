-- Create a table for allowed admin emails
create table public.allowed_users (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text unique not null,
  role text default 'supervisor' -- 'admin' or 'supervisor'
);

-- Enable Row Level Security
alter table public.allowed_users enable row level security;

-- Policies

-- 1. Admins (authenticated users) can view the list (to check access and manage it)
create policy "Authenticated users can view allowed policies"
  on public.allowed_users for select
  to authenticated
  using (true);

-- 2. Public can view (Required for Signup page to check if email is allowed before signing up)
-- Note: In a stricter env, we use a Postgres Function for this check to hide the full list.
-- For this MVP, we allow public read to check "Is my email allowed?".
create policy "Public can check allowed emails"
  on public.allowed_users for select
  to anon
  using (true);

-- 3. Only Authenticated users (Admins) can insert new allowed emails
create policy "Admins can insert allowed users"
  on public.allowed_users for insert
  to authenticated
  with check (true);

-- 4. Only Authenticated users (Admins) can delete allowed emails
create policy "Admins can delete allowed users"
  on public.allowed_users for delete
  to authenticated
  using (true);

-- Automatically insert the creating user's email if needed, or manual insertion.
-- For now, the first admin is already created. They will manually add others.
