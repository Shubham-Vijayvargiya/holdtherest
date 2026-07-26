create extension if not exists pgcrypto;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  owner_email text not null,
  shared_with_email text,
  title text not null check (char_length(title) between 1 and 500),
  notes text not null default '' check (char_length(notes) <= 5000),
  category text not null check (category in ('must_do', 'should_do', 'nice_to_have', 'unassigned')),
  status text not null default 'backlog' check (status in ('backlog', 'completed')),
  total_time_seconds integer not null default 0 check (total_time_seconds >= 0),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists tasks_owner_idx on public.tasks(user_id);
create index if not exists tasks_recipient_idx on public.tasks(lower(shared_with_email));

alter table public.tasks enable row level security;

create policy "owners and recipients can read tasks"
on public.tasks for select
using (
  auth.uid() = user_id
  or lower(shared_with_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

create policy "owners can create tasks"
on public.tasks for insert
with check (
  auth.uid() = user_id
  and lower(owner_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

create policy "owners can update tasks"
on public.tasks for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "owners can delete tasks"
on public.tasks for delete
using (auth.uid() = user_id);

revoke all on public.tasks from anon;
grant select, insert, update, delete on public.tasks to authenticated;
