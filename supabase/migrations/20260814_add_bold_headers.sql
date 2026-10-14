alter table public.letters
  add column if not exists bold_headers boolean not null default true;
