-- Hold the Rest: profiles, multi-member sharing, comments, focus history, and audit trail.
-- Run after 001_initial_schema.sql in the Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text not null default '',
  theme text not null default 'light' check (theme in ('light', 'dark')),
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  member_email text not null,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  unique (owner_id, member_email)
);

create or replace function public.enforce_member_limit()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if (select count(*) from public.members where owner_id = new.owner_id) >= 3 then
    raise exception 'You can add up to three members.';
  end if;
  return new;
end;
$$;

drop trigger if exists members_limit on public.members;
create trigger members_limit
before insert on public.members
for each row execute function public.enforce_member_limit();

create or replace function public.revoke_removed_member_shares()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.task_shares
  where shared_by = old.owner_id
    and lower(member_email) = lower(old.member_email);
  return old;
end;
$$;

alter table public.tasks add column if not exists updated_at timestamptz not null default now();

create table if not exists public.task_shares (
  task_id uuid not null references public.tasks(id) on delete cascade,
  shared_by uuid not null references auth.users(id) on delete cascade,
  member_email text not null,
  created_at timestamptz not null default now(),
  primary key (task_id, member_email)
);

drop trigger if exists member_removal_revokes_shares on public.members;
create trigger member_removal_revokes_shares
after delete on public.members
for each row execute function public.revoke_removed_member_shares();

insert into public.task_shares (task_id, shared_by, member_email)
select id, user_id, lower(shared_with_email)
from public.tasks
where shared_with_email is not null and btrim(shared_with_email) <> ''
on conflict (task_id, member_email) do nothing;

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_email text not null,
  author_name text not null default '',
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  task_title text not null,
  category text not null check (category in ('must_do', 'should_do', 'nice_to_have', 'unassigned')),
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_seconds integer not null check (duration_seconds > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.task_activity (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete cascade,
  actor_name text not null default '',
  event_type text not null check (event_type in ('created', 'category_changed', 'notes_updated', 'sharing_updated', 'completed', 'reopened')),
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.parking_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null check (char_length(text) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists members_owner_idx on public.members(owner_id);
create index if not exists task_shares_email_idx on public.task_shares(lower(member_email));
create index if not exists task_comments_task_idx on public.task_comments(task_id, created_at);
create index if not exists focus_sessions_task_idx on public.focus_sessions(task_id, started_at);
create index if not exists task_activity_task_idx on public.task_activity(task_id, created_at);
create index if not exists parking_items_owner_idx on public.parking_items(user_id);

create or replace function public.current_user_email()
returns text
language sql
stable
security invoker
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.can_access_task(target_task_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tasks t
    where t.id = target_task_id
      and (
        t.user_id = auth.uid()
        or exists (
          select 1 from public.task_shares s
          where s.task_id = t.id
            and lower(s.member_email) = public.current_user_email()
        )
      )
  );
$$;

revoke all on function public.can_access_task(uuid) from public;
grant execute on function public.can_access_task(uuid) to authenticated;

create or replace function public.add_focus_time()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.tasks
  set total_time_seconds = total_time_seconds + new.duration_seconds,
      updated_at = now()
  where id = new.task_id;
  return new;
end;
$$;

drop trigger if exists focus_session_add_time on public.focus_sessions;
create trigger focus_session_add_time
after insert on public.focus_sessions
for each row execute function public.add_focus_time();

alter table public.profiles enable row level security;
alter table public.members enable row level security;
alter table public.task_shares enable row level security;
alter table public.task_comments enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.task_activity enable row level security;
alter table public.parking_items enable row level security;

drop policy if exists "owners and recipients can read tasks" on public.tasks;
create policy "task participants can read"
on public.tasks for select
using (public.can_access_task(id));

drop policy if exists "owners can create tasks" on public.tasks;
create policy "owners can create tasks"
on public.tasks for insert
with check (
  auth.uid() = user_id
  and lower(owner_email) = public.current_user_email()
);

drop policy if exists "owners can update tasks" on public.tasks;
create policy "owners can update tasks"
on public.tasks for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "owners can delete tasks" on public.tasks;
create policy "owners can delete tasks"
on public.tasks for delete
using (auth.uid() = user_id);

create policy "users manage own profile"
on public.profiles for all
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and lower(email) = public.current_user_email()
);

create policy "users manage own member list"
on public.members for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "task participants read shares"
on public.task_shares for select
using (
  auth.uid() = shared_by
  or lower(member_email) = public.current_user_email()
);

create policy "owners create shares"
on public.task_shares for insert
with check (
  auth.uid() = shared_by
  and exists (
    select 1 from public.tasks t
    where t.id = task_id and t.user_id = auth.uid()
  )
  and exists (
    select 1 from public.members m
    where m.owner_id = auth.uid()
      and lower(m.member_email) = lower(task_shares.member_email)
  )
);

create policy "owners remove shares"
on public.task_shares for delete
using (
  auth.uid() = shared_by
  and exists (
    select 1 from public.tasks t
    where t.id = task_id and t.user_id = auth.uid()
  )
);

create policy "task participants read comments"
on public.task_comments for select
using (public.can_access_task(task_id));

create policy "task participants add comments"
on public.task_comments for insert
with check (
  auth.uid() = author_id
  and lower(author_email) = public.current_user_email()
  and public.can_access_task(task_id)
);

create policy "authors manage comments"
on public.task_comments for update
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

create policy "authors delete comments"
on public.task_comments for delete
using (auth.uid() = author_id);

create policy "task participants read focus sessions"
on public.focus_sessions for select
using (public.can_access_task(task_id));

create policy "task participants log focus sessions"
on public.focus_sessions for insert
with check (
  auth.uid() = user_id
  and lower(user_email) = public.current_user_email()
  and public.can_access_task(task_id)
);

create policy "task participants read activity"
on public.task_activity for select
using (public.can_access_task(task_id));

create policy "task participants add activity"
on public.task_activity for insert
with check (
  auth.uid() = actor_id
  and public.can_access_task(task_id)
);

create policy "users manage own parking items"
on public.parking_items for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

revoke all on public.profiles, public.members, public.task_shares, public.task_comments,
  public.focus_sessions, public.task_activity, public.parking_items from anon;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.members to authenticated;
grant select, insert, delete on public.task_shares to authenticated;
grant select, insert, update, delete on public.task_comments to authenticated;
grant select, insert on public.focus_sessions to authenticated;
grant select, insert on public.task_activity to authenticated;
grant select, insert, delete on public.parking_items to authenticated;

notify pgrst, 'reload schema';
