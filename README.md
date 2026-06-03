# SEGAV SST GYD

PWA MVP tipo ERP de prevencion y seguridad laboral para Sociedad Maderera Galvez y Di Genova Ltda.

## Estado

App base cargada en GitHub y lista para probar localmente. Funciona como MVP con persistencia local del navegador y estructura Supabase inicial para implementar base real.

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

## Implementacion rapida

```bash
git clone https://github.com/alangarciaapr-svg/SEGAV-MOBILE.git
cd SEGAV-MOBILE
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

1. Crear proyecto Supabase.
2. Copiar `.env.example` como `.env`.
3. Completar:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

4. Ejecutar en SQL Editor, en este orden:

```bash
database/01_base.sql
database/02_registros_sst.sql
database/03_control_operacional.sql
database/04_ley_karin.sql
database/05_documentos_comite.sql
```

## Despliegue recomendado

Vercel, Netlify o Cloudflare Pages.

Configuracion:

- Framework: Vite.
- Build command: `npm run build`.
- Output directory: `dist`.
- Variables: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

## Seguridad

No subir `.env`, tokens, claves secretas, `service_role` ni contrasenas. Antes de produccion real, restringir Ley Karin con roles y RLS.

## Guia detallada

Ver `docs/IMPLEMENTACION.md`.
