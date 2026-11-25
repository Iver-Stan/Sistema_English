-- ============================================================================
-- ENGLISH CLASS STUDENTS - ESQUEMA COMPLETO PARA SUPABASE (PostgreSQL + RLS)
-- ============================================================================
-- Instrucciones:
-- 1. Abre el SQL Editor en tu proyecto de Supabase.
-- 2. Pega todo este archivo y presiona "Run".
-- 3. Al final del archivo tienes la instruccion comentada para convertir a tu
--    primer usuario registrado en profesor ('admin').
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. TABLAS PRINCIPALES
-- ----------------------------------------------------------------------------

-- Perfiles vinculados 1:1 con auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  username text,
  full_name text not null,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

-- Progreso por actividad en cada unidad
create table if not exists public.activity_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  unit_id text not null default 'unit-1',
  activity_key text not null check (activity_key in ('practica', 'teoria', 'valoracion', 'produccion')),
  completed boolean not null default true,
  completed_at timestamptz not null default now(),
  unique (user_id, unit_id, activity_key)
);

-- Intentos ilimitados del cuestionario (Valoracion)
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  unit_id text not null default 'unit-1',
  attempt_number integer not null check (attempt_number > 0),
  correct_answers integer not null check (correct_answers >= 0),
  total_questions integer not null check (total_questions > 0),
  score integer not null check (score >= 0 and score <= 100),
  duration_seconds integer not null check (duration_seconds >= 0),
  created_at timestamptz not null default now()
);

-- Publicaciones del muro virtual colaborativo (Produccion / Mini-Padlet)
create table if not exists public.wall_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  unit_id text not null default 'unit-1',
  author_name text not null,
  description text not null check (char_length(trim(description)) between 1 and 500),
  image_url text not null,
  image_path text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Configuracion de enlaces externos editables por el profesor sin tocar codigo
create table if not exists public.unit_settings (
  unit_id text primary key,
  practice_url text not null,
  theory_pdf_url text,
  youtube_links jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Indices de rendimiento
create index if not exists idx_activity_progress_user_unit
  on public.activity_progress (user_id, unit_id);

create index if not exists idx_quiz_attempts_user_unit_created
  on public.quiz_attempts (user_id, unit_id, created_at desc);

create index if not exists idx_wall_posts_unit_created
  on public.wall_posts (unit_id, created_at desc);

-- ----------------------------------------------------------------------------
-- 2. FUNCIONES AUXILIARES DE SEGURIDAD (Evitan recursion infinita en RLS)
-- ----------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
  limit 1;
$$;

-- ----------------------------------------------------------------------------
-- 3. TRIGGERS AUTOMATICOS
-- ----------------------------------------------------------------------------

-- Crea automaticamente la fila en public.profiles cuando se registra un usuario en Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_full_name text;
begin
  v_email := lower(trim(coalesce(new.email, '')));
  v_full_name := trim(coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(split_part(v_email, '@', 1), ''),
    'Estudiante'
  ));

  insert into public.profiles (id, email, username, full_name, role)
  values (new.id, v_email, v_email, v_full_name, 'student')
  on conflict (id) do update
  set
    email = coalesce(nullif(excluded.email, ''), public.profiles.email),
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Fija author_name desde profiles en el servidor para evitar suplantacion de nombre
create or replace function public.set_wall_post_author_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  select full_name into v_name
  from public.profiles
  where id = new.user_id;

  new.author_name := coalesce(nullif(trim(v_name), ''), new.author_name, 'Student');
  return new;
end;
$$;

drop trigger if exists trg_wall_posts_author_name on public.wall_posts;
create trigger trg_wall_posts_author_name
  before insert on public.wall_posts
  for each row execute function public.set_wall_post_author_name();

-- Actualiza updated_at automaticamente
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_wall_posts_updated_at on public.wall_posts;
create trigger trg_wall_posts_updated_at
  before update on public.wall_posts
  for each row execute function public.set_updated_at();

drop trigger if exists trg_unit_settings_updated_at on public.unit_settings;
create trigger trg_unit_settings_updated_at
  before update on public.unit_settings
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.activity_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.wall_posts enable row level security;
alter table public.unit_settings enable row level security;

-- PROFILES
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own_no_role_change_or_admin" on public.profiles;
create policy "profiles_update_own_no_role_change_or_admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (
    public.is_admin()
    or (auth.uid() = id and role = public.get_my_role())
  );

-- ACTIVITY PROGRESS
drop policy if exists "progress_select_own_or_admin" on public.activity_progress;
create policy "progress_select_own_or_admin"
  on public.activity_progress for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "progress_insert_own" on public.activity_progress;
create policy "progress_insert_own"
  on public.activity_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "progress_update_own" on public.activity_progress;
create policy "progress_update_own"
  on public.activity_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- QUIZ ATTEMPTS
drop policy if exists "quiz_select_own_or_admin" on public.quiz_attempts;
create policy "quiz_select_own_or_admin"
  on public.quiz_attempts for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "quiz_insert_own" on public.quiz_attempts;
create policy "quiz_insert_own"
  on public.quiz_attempts for insert
  with check (auth.uid() = user_id);

-- WALL POSTS
drop policy if exists "wall_select_authenticated" on public.wall_posts;
create policy "wall_select_authenticated"
  on public.wall_posts for select
  using (auth.role() = 'authenticated');

drop policy if exists "wall_insert_own" on public.wall_posts;
create policy "wall_insert_own"
  on public.wall_posts for insert
  with check (auth.uid() = user_id);

drop policy if exists "wall_update_own" on public.wall_posts;
create policy "wall_update_own"
  on public.wall_posts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "wall_delete_own_or_admin" on public.wall_posts;
create policy "wall_delete_own_or_admin"
  on public.wall_posts for delete
  using (auth.uid() = user_id or public.is_admin());

-- UNIT SETTINGS
drop policy if exists "settings_select_authenticated" on public.unit_settings;
create policy "settings_select_authenticated"
  on public.unit_settings for select
  using (auth.role() = 'authenticated');

drop policy if exists "settings_admin_insert" on public.unit_settings;
create policy "settings_admin_insert"
  on public.unit_settings for insert
  with check (public.is_admin());

drop policy if exists "settings_admin_update" on public.unit_settings;
create policy "settings_admin_update"
  on public.unit_settings for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "settings_admin_delete" on public.unit_settings;
create policy "settings_admin_delete"
  on public.unit_settings for delete
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. VALORES INICIALES PARA UNIT 1: CLOTHES AND COLORS
-- ----------------------------------------------------------------------------

insert into public.unit_settings (unit_id, practice_url, theory_pdf_url, youtube_links)
values (
  'unit-1',
  'https://www.gamestolearnenglish.com/clothes-game/',
  null,
  '[
    {
      "title": "Clothes Vocabulary in English (Basic)",
      "description": "Repasa las prendas basicas y su pronunciacion en ingles con ejemplos visuales.",
      "url": "https://www.youtube.com/results?search_query=clothes+vocabulary+in+english+for+beginners"
    },
    {
      "title": "Colors & Clothes: What are you wearing?",
      "description": "Practica como combinar colores y ropa usando frases como I am wearing...",
      "url": "https://www.youtube.com/results?search_query=what+are+you+wearing+clothes+and+colors+english"
    },
    {
      "title": "British Council LearnEnglish - Clothes",
      "description": "Canciones y ejercicios interactivos de pronunciacion para principiantes.",
      "url": "https://www.youtube.com/results?search_query=british+council+clothes+and+colors+english"
    }
  ]'::jsonb
)
on conflict (unit_id) do nothing;

-- ----------------------------------------------------------------------------
-- 6. SUPABASE STORAGE: BUCKET Y POLITICAS PARA EL MURO VIRTUAL (wall-images)
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wall-images',
  'wall-images',
  true,
  2097152, -- 2 MB maximo
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "wall_images_public_read" on storage.objects;
create policy "wall_images_public_read"
  on storage.objects for select
  using (bucket_id = 'wall-images');

drop policy if exists "wall_images_authenticated_insert_own_folder" on storage.objects;
create policy "wall_images_authenticated_insert_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'wall-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "wall_images_authenticated_update_own_folder" on storage.objects;
create policy "wall_images_authenticated_update_own_folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'wall-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "wall_images_delete_own_or_admin" on storage.objects;
create policy "wall_images_delete_own_or_admin"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'wall-images'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

-- ----------------------------------------------------------------------------
-- 7. CONVERTIR AL PRIMER USUARIO EN PROFESOR (ADMIN)
-- ----------------------------------------------------------------------------
-- Paso 1: Registra tu cuenta desde la pagina web con tu correo electronico.
-- Paso 2: Ejecuta esta consulta en el SQL Editor reemplazando el correo:
--
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE lower(email) = 'profesor@ejemplo.com';
-- ============================================================================
