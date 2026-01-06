-- ================================================
-- 🔧 CORREÇÃO FINAL: Políticas RLS para Sync
-- ================================================
-- Este script CORRIGE as políticas sem apagar dados
-- Execute no Supabase SQL Editor

-- ================================================
-- 1. REMOVER TODAS AS POLÍTICAS ANTIGAS
-- ================================================
-- (para evitar conflitos de políticas duplicadas)

DO $$
DECLARE
  pol RECORD;
BEGIN
  -- Remover TODAS as políticas existentes da tabela time_entries
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'time_entries'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON time_entries', pol.policyname);
    RAISE NOTICE 'Removida política: %', pol.policyname;
  END LOOP;
END $$;

-- ================================================
-- 2. CRIAR POLÍTICAS CORRETAS
-- ================================================
-- Estas políticas garantem que:
-- - Admin vê e edita TUDO
-- - Diretor/Logística veem TUDO mas podem editar
-- - Encarregado vê TUDO (read-only)
-- - Técnicos veem APENAS os seus registos

-- ✅ ADMIN: Acesso total (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "admin_all_access" ON time_entries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ✅ DIRETOR E LOGÍSTICA: Podem ver TUDO e editar
CREATE POLICY "management_read_all" ON time_entries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('diretor', 'logistica')
    )
  );

CREATE POLICY "management_insert" ON time_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('diretor', 'logistica')
    )
  );

CREATE POLICY "management_update" ON time_entries
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('diretor', 'logistica')
    )
  )
  WITH CHECK (true);

-- ✅ ENCARREGADO: Vê TUDO mas apenas leitura
CREATE POLICY "encarregado_read_all" ON time_entries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'encarregado'
    )
  );

-- ✅ TÉCNICOS: Veem APENAS os seus próprios registos
CREATE POLICY "tecnico_read_own" ON time_entries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'tecnico'
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "tecnico_insert_own" ON time_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'tecnico'
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "tecnico_update_own" ON time_entries
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'tecnico'
    )
    AND user_id = auth.uid()
  )
  WITH CHECK (
    user_id = auth.uid()
  );

CREATE POLICY "tecnico_delete_own" ON time_entries
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'tecnico'
    )
    AND user_id = auth.uid()
  );

-- ================================================
-- 3. VERIFICAR RESULTADO
-- ================================================

SELECT '=== ✅ POLÍTICAS RECRIADAS ===' as status;

SELECT
  policyname as politica,
  cmd as tipo_operacao
FROM pg_policies
WHERE tablename = 'time_entries'
ORDER BY policyname;

-- Contar políticas
SELECT
  COUNT(*) as total_policies,
  CASE
    WHEN COUNT(*) >= 9 THEN '✅ OK'
    ELSE '❌ FALTAM POLÍTICAS'
  END as status
FROM pg_policies
WHERE tablename = 'time_entries';

-- ================================================
-- 4. TESTE: Ver se admin consegue ver tudo
-- ================================================

SELECT '=== TESTE: Registos visíveis ===' as teste;

SELECT COUNT(*) as total_registos_visiveis
FROM time_entries;

-- Se isto retornar um número > 0, está a funcionar!
-- Se der erro, há problema com as políticas ou com o teu role

-- ================================================
-- 5. VERIFICAR TEU UTILIZADOR
-- ================================================

SELECT '=== O TEU UTILIZADOR ===' as info;

SELECT
  (SELECT email FROM auth.users WHERE id = auth.uid()) as email,
  (SELECT role FROM profiles WHERE id = auth.uid()) as role,
  (SELECT name FROM profiles WHERE id = auth.uid()) as name;

-- ================================================
-- ✅ CONCLUÍDO
-- ================================================

SELECT '=== ✅ CORREÇÃO COMPLETA! ===' as resultado;
SELECT 'Agora testa criar um registo no telemóvel e ver se aparece no PC' as proximo_passo;
