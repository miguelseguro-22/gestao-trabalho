-- ================================================
-- 🔍 DIAGNÓSTICO COMPLETO - Sync Multi-Dispositivo
-- ================================================
-- Executa este script no Supabase SQL Editor
-- Copia TODOS os resultados e envia-me

-- ================================================
-- 1. VERIFICAR POLÍTICAS RLS ATIVAS
-- ================================================
SELECT '=== 1. POLÍTICAS RLS ATIVAS ===' as secao;

SELECT
  policyname as politica,
  cmd as comando,
  CASE
    WHEN qual IS NOT NULL THEN 'COM CONDIÇÃO'
    ELSE 'SEM CONDIÇÃO'
  END as tem_condicao
FROM pg_policies
WHERE tablename = 'time_entries'
ORDER BY policyname;

-- ================================================
-- 2. VERIFICAR TABELA PROFILES E ROLES
-- ================================================
SELECT '=== 2. UTILIZADORES E ROLES ===' as secao;

SELECT
  p.id,
  u.email,
  p.role,
  p.name,
  p.created_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.role, p.name;

-- ================================================
-- 3. REGISTOS RECENTES (ÚLTIMOS 20)
-- ================================================
SELECT '=== 3. REGISTOS RECENTES ===' as secao;

SELECT
  te.id,
  te.user_id,
  te.worker,
  te.date,
  te.template,
  te.hours,
  te.created_at,
  p.role as role_do_criador,
  p.name as nome_do_criador
FROM time_entries te
LEFT JOIN profiles p ON p.id = te.user_id
ORDER BY te.created_at DESC
LIMIT 20;

-- ================================================
-- 4. CONTAGEM POR USER_ID E ROLE
-- ================================================
SELECT '=== 4. CONTAGEM POR UTILIZADOR ===' as secao;

SELECT
  te.user_id,
  p.name as nome,
  p.role,
  COUNT(*) as total_registos,
  MIN(te.date) as primeiro_registo,
  MAX(te.date) as ultimo_registo
FROM time_entries te
LEFT JOIN profiles p ON p.id = te.user_id
GROUP BY te.user_id, p.name, p.role
ORDER BY total_registos DESC;

-- ================================================
-- 5. VERIFICAR RLS ATIVO
-- ================================================
SELECT '=== 5. RLS ATIVADO? ===' as secao;

SELECT
  tablename as tabela,
  CASE
    WHEN rowsecurity THEN '✅ RLS ATIVO'
    ELSE '❌ RLS DESATIVADO'
  END as status_rls
FROM pg_tables
WHERE tablename = 'time_entries';

-- ================================================
-- 6. TESTAR ACESSO COMO USER ATUAL
-- ================================================
SELECT '=== 6. TESTE: Registos visíveis para ti ===' as secao;

SELECT COUNT(*) as registos_visiveis_para_mim
FROM time_entries;
-- Se der erro aqui, as RLS estão a bloquear o teu acesso!

-- ================================================
-- 7. VERIFICAR SE HÁ POLÍTICAS DUPLICADAS
-- ================================================
SELECT '=== 7. VERIFICAR DUPLICADOS ===' as secao;

SELECT
  policyname,
  COUNT(*) as quantidade
FROM pg_policies
WHERE tablename = 'time_entries'
GROUP BY policyname
HAVING COUNT(*) > 1;

-- ================================================
-- 8. VERIFICAR ESTRUTURA DA TABELA
-- ================================================
SELECT '=== 8. COLUNAS DA TABELA time_entries ===' as secao;

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'time_entries'
ORDER BY ordinal_position;

-- ================================================
-- 9. VERIFICAR SE PROFILES TEM OS CAMPOS CERTOS
-- ================================================
SELECT '=== 9. ESTRUTURA DA TABELA profiles ===' as secao;

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ================================================
-- 10. VERIFICAR O TEU UTILIZADOR ATUAL
-- ================================================
SELECT '=== 10. O MEU UTILIZADOR ATUAL ===' as secao;

SELECT
  auth.uid() as meu_user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as meu_email,
  (SELECT role FROM profiles WHERE id = auth.uid()) as meu_role,
  (SELECT name FROM profiles WHERE id = auth.uid()) as meu_nome;

-- ================================================
-- FIM DO DIAGNÓSTICO
-- ================================================
SELECT '=== ✅ DIAGNÓSTICO COMPLETO ===' as secao;
SELECT 'Copia TODOS os resultados acima e envia ao Claude' as instrucoes;
