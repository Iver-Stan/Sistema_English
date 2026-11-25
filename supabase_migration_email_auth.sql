-- ============================================================================
-- MIGRACION INCREMENTAL: AUTENTICACION CON CORREO ELECTRONICO REAL
-- ============================================================================
-- Ejecuta este script en el SQL Editor de tu proyecto existente en Supabase.
-- NO borra ninguna tabla ni ningun dato previo de estudiantes, progreso,
-- intentos de quiz o publicaciones del muro.
-- ============================================================================

-- 1. Agregar columna email a profiles si aun no existe
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text;

-- 2. Rellenar el correo real desde auth.users para los usuarios existentes
UPDATE public.profiles p
SET email = lower(trim(u.email))
FROM auth.users u
WHERE p.id = u.id
  AND (p.email IS NULL OR p.email = '');

-- 3. Permitir username opcional y quitar restriccion unica antigua de username
ALTER TABLE public.profiles
  ALTER COLUMN username DROP NOT NULL;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_username_key;

-- 4. Garantizar unicidad por correo electronico (insensible a mayusculas)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique_idx
  ON public.profiles (lower(email))
  WHERE email IS NOT NULL;

-- 5. Actualizar trigger de nuevos registros para guardar el correo real
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_full_name text;
BEGIN
  v_email := lower(trim(coalesce(new.email, '')));
  v_full_name := trim(coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(split_part(v_email, '@', 1), ''),
    'Estudiante'
  ));

  INSERT INTO public.profiles (id, email, username, full_name, role)
  VALUES (new.id, v_email, v_email, v_full_name, 'student')
  ON CONFLICT (id) DO UPDATE
  SET
    email = COALESCE(NULLIF(EXCLUDED.email, ''), public.profiles.email),
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name);

  RETURN new;
END;
$$;

-- 6. (Opcional) Sincronizar si algun usuario cambia de correo en auth.users
CREATE OR REPLACE FUNCTION public.handle_user_email_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles
    SET email = lower(trim(NEW.email))
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_email_update();

-- ============================================================================
-- ASIGNAR ROL DE PROFESOR (ADMIN) POR CORREO ELECTRONICO
-- ============================================================================
-- Reemplaza el correo de ejemplo por el correo real del profesor y ejecutalo:
--
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE lower(email) = 'profesor@ejemplo.com';
-- ============================================================================
