# Implementacion inmediata - SEGAV SST GYD

Esta guia deja la app lista para probar localmente, conectar Supabase y desplegar.

## 1. Probar localmente

```bash
git clone https://github.com/alangarciaapr-svg/SEGAV-MOBILE.git
cd SEGAV-MOBILE
npm install
npm run dev
```

Abrir `http://localhost:5173`.

## 2. Crear Supabase

Crear un proyecto en Supabase. Luego copiar `.env.example` como `.env` y completar:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

No usar `service_role` en el frontend.

## 3. Ejecutar base de datos

Ejecutar `schema.sql` en SQL Editor. Si se agregan migraciones posteriores, ejecutarlas en orden.

## 4. Usar la app

La version actual funciona como MVP con persistencia local del navegador. Es util para revisar flujo, modulos y pantallas. Para produccion se debe conectar cada formulario a tablas Supabase y activar Auth/RLS.

## 5. Desplegar rapido

En Vercel o Netlify:

- Importar repositorio `alangarciaapr-svg/SEGAV-MOBILE`.
- Framework: Vite.
- Build command: `npm run build`.
- Output directory: `dist`.
- Agregar variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

## 6. Seguridad minima

- No subir `.env`.
- No subir tokens de GitHub.
- No subir `service_role`.
- Restringir Ley Karin por rol antes de uso productivo.
