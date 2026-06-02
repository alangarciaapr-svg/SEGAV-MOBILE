# SEGAV SST GYD

PWA MVP tipo ERP de prevencion y seguridad laboral para Sociedad Maderera Galvez y Di Genova Ltda.

## Estado del repositorio

Version base cargada directamente desde ChatGPT con commits incrementales para evitar bloqueos del conector.

## Modulos visibles

- Dashboard SST DS44.
- Trabajadores con validacion de RUT chileno.
- Cargos y matriz de riesgos base.
- Capacitaciones.
- IRL / Obligacion de Informar Riesgos.
- RIOHS.
- Entrega de EPP.
- Inspecciones SST.
- Hallazgos y acciones correctivas.
- Accidentes e incidentes.
- Ley Karin.
- Documentos SGSST.
- Comite Paritario.

## Uso local

```bash
npm install
npm run dev
```

Abrir:

```bash
http://localhost:5173
```

## Build

```bash
npm run build
npm run preview
```

## Supabase

1. Copiar `.env.example` como `.env`.
2. Completar:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

3. Ejecutar `schema.sql` o el esquema ampliado que se agregue en futuras versiones.

## Seguridad

No subir `.env`, claves secretas, `service_role`, contrasenas ni tokens personales al repositorio.
