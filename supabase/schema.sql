create table if not exists equipment (
  id text primary key,
  name text not null,
  category text not null,
  serial_number text not null unique,
  location text not null,
  condition text not null,
  status text not null default 'available',
  notes text not null default ''
);

create table if not exists students (
  id text primary key,
  name text not null,
  student_number text not null unique,
  email text not null unique,
  department text not null,
  year text not null
);

create table if not exists checkouts (
  id text primary key,
  equipment_id text not null references equipment (id) on delete cascade,
  student_id text not null references students (id) on delete cascade,
  checkout_date date not null,
  due_date date not null,
  returned_date date
);

alter table equipment enable row level security;
alter table students enable row level security;
alter table checkouts enable row level security;

-- This app has no authentication, so every row is readable and writable by
-- anyone holding the anon key. Enabling RLS with an explicit permissive
-- policy (rather than leaving it disabled) keeps the default-safe posture
-- even though this particular policy is wide open.
create policy "public read/write" on equipment for all using (true) with check (true);
create policy "public read/write" on students for all using (true) with check (true);
create policy "public read/write" on checkouts for all using (true) with check (true);

-- Written to twice a week by .github/workflows/keep-supabase-alive.yml.
-- Read-only pings didn't stop the free plan from pausing the project, so the
-- workflow inserts a row to create real database activity. Anon may only
-- insert here; there is no select/update/delete policy.
create table if not exists keep_alive (
  id bigint generated always as identity primary key,
  pinged_at timestamptz not null default now()
);

alter table keep_alive enable row level security;

create policy "anon insert pings" on keep_alive for insert to anon with check (true);

-- Keeps the demo loans looking current: once a day, if the newest checkout is
-- older than yesterday, every date moves forward by the same amount.
-- Runs with pg_cron.
create extension if not exists pg_cron;

create or replace function public.shift_demo_checkouts()
returns void
language plpgsql
set search_path = public
as $$
declare
  shift integer;
begin
  select (current_date - 1) - max(checkout_date) into shift from public.checkouts;
  if shift is null or shift <= 0 then
    return;
  end if;
  update public.checkouts
  set checkout_date = checkout_date + shift,
      due_date = due_date + shift,
      returned_date = returned_date + shift;
end;
$$;

revoke execute on function public.shift_demo_checkouts() from public, anon, authenticated;

select cron.schedule('shift-demo-checkouts', '5 0 * * *', 'select public.shift_demo_checkouts()');
