-- Create a table to track website visits
create table site_visits (
  id uuid default uuid_generate_v4() primary key,
  visited_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table site_visits enable row level security;

-- Create a policy that allows anyone (anonymous users) to insert a visit record
create policy "Allow anonymous inserts"
  on site_visits for insert
  with check (true);

-- Create a policy that allows only authenticated users (admins) to view visits
create policy "Allow authenticated selects"
  on site_visits for select
  using (auth.role() = 'authenticated');
