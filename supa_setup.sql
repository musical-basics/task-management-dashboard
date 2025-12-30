-- Create projects table
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  mode text CHECK (mode IN ('creative', 'technical', 'admin')) DEFAULT 'creative',
  emoji text DEFAULT '🚀',
  context text
);

-- Enable RLS
alter table projects enable row level security;

-- Create Policy: Allow anyone to create (for now, until auth is strict)
-- Note: In a real app with auth, you'd check auth.uid()
create policy "Enable insert for all users" on projects for insert with check (true);

-- Create Policy: Allow anyone to read
create policy "Enable select for all users" on projects for select using (true);
