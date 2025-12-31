-- 1. Create Categories Table
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  sort_order integer default 0
);

-- 2. Insert Default Categories
insert into categories (name, sort_order) values 
('Creative', 0), 
('Technical', 1), 
('Admin', 2);

-- 3. Modify Projects Table
alter table projects add column if not exists category_id uuid references categories(id) on delete set null;
alter table projects add column if not exists sort_order integer default 0;

-- 4. Migrate Existing Data (Map 'mode' to new 'category_id')
do $$
declare
  creative_id uuid;
  technical_id uuid;
  admin_id uuid;
begin
  select id into creative_id from categories where name = 'Creative';
  select id into technical_id from categories where name = 'Technical';
  select id into admin_id from categories where name = 'Admin';

  update projects set category_id = creative_id where mode = 'creative';
  update projects set category_id = technical_id where mode = 'technical';
  update projects set category_id = admin_id where mode = 'admin';
end $$;

-- 5. Enable RLS
alter table categories enable row level security;

-- 6. Add Policies
create policy "Allow read access for all users" on categories for select using (true);
create policy "Allow insert access for all users" on categories for insert with check (true);
create policy "Allow update access for all users" on categories for update using (true);
create policy "Allow delete access for all users" on categories for delete using (true);

-- Ensure projects RLS allows updating the new columns
-- (Existing policies usually cover all columns, but good to verify)
