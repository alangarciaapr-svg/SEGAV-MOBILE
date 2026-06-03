create table if not exists capacitaciones (
  id uuid primary key default gen_random_uuid(),
  tema text not null,
  descripcion text,
  fecha date,
  lugar text,
  duracion numeric,
  relator text,
  created_at timestamptz default now()
);

create table if not exists asistencia_capacitacion (
  id uuid primary key default gen_random_uuid(),
  capacitacion_id uuid references capacitaciones(id) on delete cascade,
  trabajador_id uuid references trabajadores(id) on delete cascade,
  firma text,
  created_at timestamptz default now()
);

create table if not exists irl_registros (
  id uuid primary key default gen_random_uuid(),
  trabajador_id uuid references trabajadores(id),
  cargo text,
  centro text,
  fecha date,
  version text,
  estado text,
  created_at timestamptz default now()
);

create table if not exists riohs_registros (
  id uuid primary key default gen_random_uuid(),
  trabajador_id uuid references trabajadores(id),
  fecha date,
  medio text,
  estado text,
  created_at timestamptz default now()
);

create table if not exists epp_entregas (
  id uuid primary key default gen_random_uuid(),
  trabajador_id uuid references trabajadores(id),
  item text,
  talla text,
  fecha date,
  reposicion date,
  created_at timestamptz default now()
);
