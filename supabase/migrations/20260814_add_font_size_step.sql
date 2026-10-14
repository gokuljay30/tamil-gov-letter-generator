alter table public.letters
  add column if not exists font_size_step smallint not null default 0;

alter table public.letters
  drop constraint if exists letters_font_size_step_check;

alter table public.letters
  add constraint letters_font_size_step_check check (font_size_step between -2 and 2);
