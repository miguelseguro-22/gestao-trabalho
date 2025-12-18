-- ================================================
-- DEBUG: Verificar porque Admin não vê registos
-- ================================================
-- Execute este script no Supabase SQL Editor
-- e partilhe os resultados completos

-- ================================================
-- 1. Ver RLS policies ativas
-- ================================================
SELECT
  '=== RLS POLICIES ATIVAS ===' as info;

SELECT
  policyname,
  cmd as comando,
  qual::text as condicao
FROM pg_policies
WHERE tablename = 'time_entries'
ORDER BY policyname;

-- ================================================
-- 2. Ver TODOS os registos (bypass RLS como superuser)
-- ================================================
SELECT
  '=== TODOS OS REGISTOS (BYPASS RLS) ===' as info;

SELECT
  id,
  user_id,
  worker,
  date,
  template,
  hours,
  created_at
FROM time_entries
ORDER BY created_at DESC
LIMIT 20;

-- ================================================
-- 3. Contar registos por user_id
-- ================================================
SELECT
  '=== CONTAGEM POR USER_ID ===' as info;

SELECT
  user_id,
  COUNT(*) as total_registos,
  MIN(date) as data_primeiro_registo,
  MAX(date) as data_ultimo_registo
FROM time_entries
GROUP BY user_id
ORDER BY total_registos DESC;

-- ================================================
-- 4. Verificar tabela profiles
-- ================================================
SELECT
  '=== PROFILES E ROLES ===' as info;

SELECT
  p.id,
  au.email,
  p.role,
  p.name
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY p.role, p.name;

-- ================================================
-- 5. Testar query como ADMIN (simular frontend)
-- ================================================
-- NOTA: Isto só funciona se executares como admin autenticado
-- Se deres erro, é porque não tens permissão (problema de RLS!)

SELECT
  '=== TESTE: Query como admin (sem filtro) ===' as info;

SELECT COUNT(*) as total_registos_visiveis_para_admin
FROM time_entries;
-- Se der erro aqui, as RLS estão a bloquear!

-- ================================================
-- 6. Verificar se RLS está ATIVADO
-- ================================================
SELECT
  '=== RLS ATIVADO? ===' as info;

SELECT
  tablename,
  rowsecurity as rls_ativado
FROM pg_tables
WHERE tablename = 'time_entries';

-- ================================================
-- RESULTADOS ESPERADOS:
-- ================================================
-- Query 1: Deve mostrar policies incluindo "admin_all_access"
-- Query 2: Deve mostrar registos de técnicos (se existirem)
-- Query 3: Deve mostrar vários user_id diferentes
-- Query 4: Deve mostrar utilizadores com role 'admin', 'tecnico', etc
-- Query 5: Deve retornar número > 0 (se houver registos)
-- Query 6: Deve mostrar rls_ativado = true
