create table if not exists inspecciones (
  id uuid primary key default gen_random_uuid(),
  centro text,
  fecha date,
  resultado text,
  inspector text,
  created_at timestamptz default now()
);

create table if not exists inspeccion_respuestas (
  id uuid primary key default gen_random_uuid(),
  inspeccion_id uuid references inspecciones(id) on delete cascade,
  item text,
  respuesta text,
  observacion text,
  created_at timestamptz default now()
);

create table if not exists hallazgos (
  id uuid primary key default gen_random_uuid(),
  inspeccion_id uuid references inspecciones(id),
  descripcion text,
  criticidad text,
  responsable text,
  compromiso date,
  estado text default 'Abierto',
  created_at timestamptz default now()
);

create table if not exists acciones_correctivas (
  id uuid primary key default gen_random_uuid(),
  hallazgo_id uuid references hallazgos(id) on delete cascade,
  accion text,
  responsable text,
  fecha_compromiso date,
  estado text default 'Pendiente',
  created_at timestamptz default now()
);

create table if not exists accidentes_incidentes (
  id uuid primary key default gen_random_uuid(),
  tipo text,
  fecha date,
  lugar text,
  trabajador_id uuid references trabajadores(id),
  descripcion text,
  causas text,
  medidas text,
  estado text,
  created_at timestamptz default now()
);
