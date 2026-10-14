-- SAFE ADDITIVE MIGRATION: Templates phase
-- Run this against the existing database. It does not drop, truncate, rename,
-- or rewrite settings, letters, users, or authentication data.

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_key text,
  name text not null,
  category text,
  description text,
  department_heading text,
  sender jsonb,
  recipient jsonb,
  salutation text,
  subject text,
  "references" jsonb,
  body text,
  signature jsonb,
  variables jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_used_at timestamptz
);

alter table public.templates add column if not exists template_key text;

create unique index if not exists templates_user_template_key_idx
  on public.templates (user_id, template_key);

create index if not exists templates_user_updated_idx
  on public.templates (user_id, updated_at desc);

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'templates_set_updated_at'
      and tgrelid = 'public.templates'::regclass
  ) then
    create trigger templates_set_updated_at
    before update on public.templates
    for each row execute function public.set_updated_at();
  end if;
end $$;

alter table public.templates enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'templates' and policyname = 'Users select their templates') then
    create policy "Users select their templates" on public.templates for select using ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'templates' and policyname = 'Users insert their templates') then
    create policy "Users insert their templates" on public.templates for insert with check ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'templates' and policyname = 'Users update their templates') then
    create policy "Users update their templates" on public.templates for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'templates' and policyname = 'Users delete their templates') then
    create policy "Users delete their templates" on public.templates for delete using ((select auth.uid()) = user_id);
  end if;
end $$;
