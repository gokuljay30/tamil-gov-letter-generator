create extension if not exists pgcrypto;

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  department_heading text not null default '',
  default_sender jsonb not null default '{"lines":[]}'::jsonb,
  default_recipient jsonb not null default '{"lines":[]}'::jsonb,
  default_signature jsonb not null default '{"closing":"","lines":[]}'::jsonb,
  default_salutation text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Safe migration for projects that ran an earlier Phase 3 schema.
alter table public.settings
  add column if not exists default_recipient jsonb not null default '{"lines":[]}'::jsonb;

create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'completed')),
  letter_type text not null default 'government_letter'
    check (letter_type in ('government_letter', 'financial_sanction', 'receipt', 'proceedings')),
  type_data jsonb not null default '{}'::jsonb,
  bold_headers boolean not null default true,
  font_size_step smallint not null default 0 check (font_size_step between -2 and 2),
  file_number text not null default '',
  letter_date text not null default '',
  department_heading text not null default '',
  sender jsonb not null default '{"lines":[]}'::jsonb,
  recipient jsonb not null default '{"lines":[]}'::jsonb,
  salutation text not null default '',
  subject text not null default '',
  "references" jsonb not null default '[]'::jsonb,
  body text not null default '',
  signature jsonb not null default '{"closing":"","lines":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.letters
  add column if not exists bold_headers boolean not null default true;

alter table public.letters
  add column if not exists font_size_step smallint not null default 0;

alter table public.letters
  add column if not exists letter_type text not null default 'government_letter';

alter table public.letters
  add column if not exists type_data jsonb not null default '{}'::jsonb;

alter table public.letters
  drop constraint if exists letters_font_size_step_check;

alter table public.letters
  add constraint letters_font_size_step_check
  check (font_size_step between -2 and 2);

alter table public.letters
  drop constraint if exists letters_letter_type_check;

alter table public.letters
  add constraint letters_letter_type_check
  check (letter_type in ('government_letter', 'financial_sanction', 'receipt', 'proceedings'));

create index if not exists letters_user_updated_idx
  on public.letters (user_id, updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at
before update on public.settings
for each row execute function public.set_updated_at();

drop trigger if exists letters_set_updated_at on public.letters;
create trigger letters_set_updated_at
before update on public.letters
for each row execute function public.set_updated_at();

alter table public.settings enable row level security;
alter table public.letters enable row level security;

drop policy if exists "Users manage their settings" on public.settings;
create policy "Users manage their settings"
on public.settings for all
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage their letters" on public.letters;
create policy "Users manage their letters"
on public.letters for all
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- ================================================================
-- Templates phase: reusable letter content (new, additive schema)
-- ================================================================

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

alter table public.templates
  add column if not exists template_key text;

create unique index if not exists templates_user_template_key_idx
  on public.templates (user_id, template_key);

create index if not exists templates_user_updated_idx
  on public.templates (user_id, updated_at desc);

drop trigger if exists templates_set_updated_at on public.templates;
create trigger templates_set_updated_at
before update on public.templates
for each row execute function public.set_updated_at();

alter table public.templates enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'templates'
      and policyname = 'Users select their templates'
  ) then
    create policy "Users select their templates" on public.templates
      for select using ((select auth.uid()) = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'templates'
      and policyname = 'Users insert their templates'
  ) then
    create policy "Users insert their templates" on public.templates
      for insert with check ((select auth.uid()) = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'templates'
      and policyname = 'Users update their templates'
  ) then
    create policy "Users update their templates" on public.templates
      for update using ((select auth.uid()) = user_id)
      with check ((select auth.uid()) = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'templates'
      and policyname = 'Users delete their templates'
  ) then
    create policy "Users delete their templates" on public.templates
      for delete using ((select auth.uid()) = user_id);
  end if;
end $$;

-- Refresh PostgREST's schema cache after additive upgrades.
notify pgrst, 'reload schema';
