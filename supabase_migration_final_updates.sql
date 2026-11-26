-- ============================================================================
-- MIGRACION INCREMENTAL FINAL:
-- 1) Segundo enlace de juego (Wordwall) en unit_settings
-- 2) Tabla unit_reflections (2 preguntas abiertas de reflexion) + RLS
-- ============================================================================
-- Ejecuta este script en el SQL Editor de tu proyecto existente en Supabase.
-- NO borra tablas ni datos previos.
-- ============================================================================

-- 1. Agregar enlace de Wordwall (Actividad 1 de Practica) en unit_settings
ALTER TABLE public.unit_settings
  ADD COLUMN IF NOT EXISTS practice_wordwall_url text;

UPDATE public.unit_settings
SET practice_wordwall_url = 'https://wordwall.net/play/124803/034/685?wwmethod=link'
WHERE unit_id = 'unit-1'
  AND (practice_wordwall_url IS NULL OR trim(practice_wordwall_url) = '');

-- 2. Crear tabla de reflexiones personales (1 registro unico por estudiante y unidad)
CREATE TABLE IF NOT EXISTS public.unit_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  unit_id text NOT NULL DEFAULT 'unit-1',
  answer_1 text NOT NULL CHECK (char_length(trim(answer_1)) >= 10),
  answer_2 text NOT NULL CHECK (char_length(trim(answer_2)) >= 10),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, unit_id)
);

CREATE INDEX IF NOT EXISTS idx_unit_reflections_unit_updated
  ON public.unit_reflections (unit_id, updated_at DESC);

-- Reutiliza la funcion set_updated_at() existente para actualizar updated_at
DROP TRIGGER IF EXISTS trg_unit_reflections_updated_at ON public.unit_reflections;
CREATE TRIGGER trg_unit_reflections_updated_at
  BEFORE UPDATE ON public.unit_reflections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Politicas Row Level Security (RLS) para unit_reflections
ALTER TABLE public.unit_reflections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reflections_select_own_or_admin" ON public.unit_reflections;
CREATE POLICY "reflections_select_own_or_admin"
  ON public.unit_reflections FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "reflections_insert_own" ON public.unit_reflections;
CREATE POLICY "reflections_insert_own"
  ON public.unit_reflections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reflections_update_own" ON public.unit_reflections;
CREATE POLICY "reflections_update_own"
  ON public.unit_reflections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
