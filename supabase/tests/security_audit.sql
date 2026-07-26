-- Read-only deployment audit for Hold the Rest.
-- Run in the Supabase SQL editor after all migrations.

do $$
declare
  missing_rls text[];
  anon_tables text[];
begin
  select array_agg(tablename)
  into missing_rls
  from pg_tables
  where schemaname = 'public'
    and tablename = any(array[
      'tasks', 'profiles', 'members', 'task_shares', 'task_comments',
      'focus_sessions', 'active_focus_sessions', 'task_activity', 'parking_items'
    ])
    and not rowsecurity;

  if missing_rls is not null then
    raise exception 'RLS is disabled on: %', array_to_string(missing_rls, ', ');
  end if;

  select array_agg(table_name)
  into anon_tables
  from information_schema.role_table_grants
  where table_schema = 'public'
    and grantee = 'anon'
    and table_name = any(array[
      'tasks', 'profiles', 'members', 'task_shares', 'task_comments',
      'focus_sessions', 'active_focus_sessions', 'task_activity', 'parking_items'
    ]);

  if anon_tables is not null then
    raise exception 'Anonymous table grants found on: %', array_to_string(anon_tables, ', ');
  end if;
end
$$;

select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
