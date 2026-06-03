create extension if not exists pgcrypto;

create table if not exists empresa_config (
  id uuid primary key default gen_random_uuid(),
  razon_social text not null,
  rut text,
  ubicacion text,
  organismo_administrador text,
  prevencionista text,
  dotacion integer,
  created_at timestamptz default now()
);

create table if not exists trabajadores (
  id uuid primary key default gen_random_uuid(),
  rut text not null unique,
  nombre text not null,
  cargo text,
  area text,
  centro text,
  fecha_ingreso date,
  estado text default 'Activo',
  created_at timestamptz default now()
);
