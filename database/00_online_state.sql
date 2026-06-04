-- SEGAV SST GYD - Estado online inicial para Supabase
-- Ejecutar este archivo primero en Supabase > SQL Editor.
-- Permite que la app guarde su estado completo en Supabase mientras se evoluciona a tablas relacionales por modulo.

create extension if not exists pgcrypto;

create table if not exists public.segav_app_state (
  id text primary key default 'main',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_segav_app_state_updated_at on public.segav_app_state;
create trigger trg_segav_app_state_updated_at
before update on public.segav_app_state
for each row execute function public.set_updated_at();

alter table public.segav_app_state enable row level security;

-- Politicas abiertas para MVP sin login.
-- Cuando se implemente Supabase Auth, reemplazar por politicas por rol.
drop policy if exists "segav_app_state_select_anon" on public.segav_app_state;
drop policy if exists "segav_app_state_insert_anon" on public.segav_app_state;
drop policy if exists "segav_app_state_update_anon" on public.segav_app_state;

create policy "segav_app_state_select_anon"
on public.segav_app_state for select
to anon, authenticated
using (true);

create policy "segav_app_state_insert_anon"
on public.segav_app_state for insert
to anon, authenticated
with check (id = 'main');

create policy "segav_app_state_update_anon"
on public.segav_app_state for update
to anon, authenticated
using (id = 'main')
with check (id = 'main');

insert into public.segav_app_state (id, data)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;
