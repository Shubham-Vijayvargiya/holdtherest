-- Hold the Rest usability and reliability release.
-- Adds scheduling, undoable deletion, persistent focus state, member status,
-- and realtime publication while preserving row-level isolation.

alter table public.tasks
  add column if not exists due_at timestamptz,
  add column if not exists reminder_enabled boolean not null default false,
  add column if not exists deleted_at timestamptz;

create index if not exists tasks_due_idx
  on public.tasks(user_id, due_at)
  where deleted_at is null;

alter table public.members
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'active')),
  add column if not exists accepted_at timestamptz;

update public.members m
set status = 'active',
    accepted_at = coalesce(m.accepted_at, now())
where exists (
  select 1 from public.profiles p
  where lower(p.email) = lower(m.member_email)
);

create or replace function public.activate_matching_memberships()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.members
  set status = 'active',
      accepted_at = coalesce(accepted_at, now())
  where lower(member_email) = lower(new.email);
  return new;
end;
$$;

drop trigger if exists profile_activates_memberships on public.profiles;
create trigger profile_activates_memberships
after insert or update of email on public.profiles
for each row execute function public.activate_matching_memberships();

create table if not exists public.active_focus_sessions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  preset_seconds integer not null check (preset_seconds between 60 and 14400),
  accumulated_seconds integer not null default 0 check (accumulated_seconds >= 0),
  started_at timestamptz,
  is_running boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.active_focus_sessions enable row level security;

drop policy if exists "users manage own active focus" on public.active_focus_sessions;
create policy "users manage own active focus"
on public.active_focus_sessions for all
using (
  auth.uid() = user_id
  and public.can_access_task(task_id)
)
with check (
  auth.uid() = user_id
  and public.can_access_task(task_id)
);

revoke all on public.active_focus_sessions from anon;
grant select, insert, update, delete on public.active_focus_sessions to authenticated;

alter table public.task_activity
  drop constraint if exists task_activity_event_type_check;
alter table public.task_activity
  add constraint task_activity_event_type_check
  check (event_type in (
    'created',
    'category_changed',
    'notes_updated',
    'sharing_updated',
    'due_date_changed',
    'completed',
    'reopened',
    'deleted',
    'restored'
  ));

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
      and t.deleted_at is null
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

alter table public.tasks replica identity full;
alter table public.task_shares replica identity full;
alter table public.task_comments replica identity full;
alter table public.focus_sessions replica identity full;
alter table public.task_activity replica identity full;
alter table public.members replica identity full;
alter table public.active_focus_sessions replica identity full;
alter table public.parking_items replica identity full;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'tasks',
    'task_shares',
    'task_comments',
    'focus_sessions',
    'task_activity',
    'members',
    'active_focus_sessions',
    'parking_items'
  ]
  loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end
$$;

notify pgrst, 'reload schema';
