alter table public.letters
  add column if not exists letter_type text not null default 'government_letter';

alter table public.letters
  add column if not exists type_data jsonb not null default '{}'::jsonb;

alter table public.letters
  drop constraint if exists letters_letter_type_check;

alter table public.letters
  add constraint letters_letter_type_check
  check (letter_type in ('government_letter', 'financial_sanction', 'receipt'));

notify pgrst, 'reload schema';
