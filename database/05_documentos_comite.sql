create table if not exists documentos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text,
  estado text,
  url text,
  created_at timestamptz default now()
);

create table if not exists evidencias (
  id uuid primary key default gen_random_uuid(),
  modulo text,
  registro_id uuid,
  nombre text,
  url text,
  created_at timestamptz default now()
);

create table if not exists comite_paritario (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  cargo_comite text,
  created_at timestamptz default now()
);

create table if not exists actas_comite (
  id uuid primary key default gen_random_uuid(),
  fecha date,
  nombre text,
  acuerdos integer default 0,
  created_at timestamptz default now()
);
