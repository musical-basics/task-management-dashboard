-- Enable UPDATE and DELETE for projects
create policy "Enable update for all users" on projects for update using (true) with check (true);
create policy "Enable delete for all users" on projects for delete using (true);

-- Enable UPDATE and DELETE for tasks (if not already enabled)
create policy "Enable update for all users" on tasks for update using (true) with check (true);
create policy "Enable delete for all users" on tasks for delete using (true);
