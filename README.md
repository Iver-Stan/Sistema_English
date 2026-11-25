# English Class Students (Beta)

Plataforma web educativa gamificada para estudiantes de **1.º de secundaria** (12–13 años), construida con **React + TypeScript + Vite + Tailwind CSS v4**, usando **Supabase** (Auth con correo electrónico real y recuperación de contraseña, PostgreSQL, RLS y Storage) y lista para desplegar gratuitamente en **Vercel**.

---

## Novedades de esta versión
- **Autenticación con correo electrónico real + recuperación de contraseña** (`/reset-password`).
- **Desbloqueo secuencial guiado en UNIT 1:** `1. Práctica → 2. Teoría → 3. Producción → 4. Valoración`.
- **Límite estricto de 2 intentos en Valoración** validado contra Supabase, con consignas e instrucciones en español.
- **Diseño visual nocturno inspirado en Quizizz** con tarjetas elevadas, botones 3D táctiles y panel administrativo limpio para el profesor.

---

## Si ya tenías una base de datos anterior en Supabase
Ejecuta en el **SQL Editor** el script incremental [`supabase_migration_email_auth.sql`](./supabase_migration_email_auth.sql) (no borra tablas ni datos existentes). Si es una instalación desde cero, usa [`supabase_schema.sql`](./supabase_schema.sql).

---

## Ajustes recomendados en Supabase (Auth y Recuperación de Contraseña)
1. **Authentication → URL Configuration:**
   - **Site URL:** `https://tu-proyecto.vercel.app` (o `http://localhost:5173` en pruebas locales).
   - **Redirect URLs:** agrega exactamente:
     - `http://localhost:5173/reset-password`
     - `https://tu-proyecto.vercel.app/reset-password`
2. **Authentication → Providers → Email:**
   - Decide si quieres **Confirm email** activado (más seguridad de correo real) o desactivado (registro inmediato sin paso de verificación). La app maneja ambos casos con mensajes claros en español.
3. **Límite de correos en plan gratuito:** Supabase permite un número limitado de correos por hora desde su servidor SMTP por defecto. Si se supera, la app muestra el aviso correspondiente.
4. **Asignar rol de profesor (`admin`):**
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE lower(email) = 'correo-del-profesor@ejemplo.com';
```
