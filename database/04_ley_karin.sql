create table if not exists ley_karin_denuncias (
  id uuid primary key default gen_random_uuid(),
  fecha date,
  denunciante text,
  tipo text,
  medidas text,
  investigacion text,
  estado text,
  cierre text,
  created_at timestamptz default now()
);
