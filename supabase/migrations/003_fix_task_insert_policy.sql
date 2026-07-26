-- Allow task owners to read the row returned by their own insert immediately.
-- Shared recipients continue to be checked through can_access_task().

drop policy if exists "task participants can read" on public.tasks;

create policy "task participants can read"
on public.tasks for select
using (
  auth.uid() = user_id
  or public.can_access_task(id)
);

notify pgrst, 'reload schema';
