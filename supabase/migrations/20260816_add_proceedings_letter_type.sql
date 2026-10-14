alter table public.letters
  drop constraint if exists letters_letter_type_check;

alter table public.letters
  add constraint letters_letter_type_check
  check (letter_type in ('government_letter', 'financial_sanction', 'receipt', 'proceedings'));

notify pgrst, 'reload schema';
