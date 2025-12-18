-- =====================================================
-- CORREÇÃO: Políticas RLS - Isolamento Técnicos
-- =====================================================
-- Este script corrige as políticas para garantir que:
-- - Técnicos APENAS veem seus próprios registos
-- - Admin vê TUDO
-- - O filtro é por user_id (não por nome)

-- 1. REMOVER políticas antigas
DROP POLICY IF EXISTS "admin_all_access" ON time_entries;
DROP POLICY IF EXISTS "management_read_all" ON time_entries;
DROP POLICY IF EXISTS "tecnico_own_data" ON time_entries;
DROP POLICY IF EXISTS "tecnico_insert_own" ON time_entries;
DROP POLICY IF EXISTS "tecnico_update_own" ON time_entries;
DROP POLICY IF EXISTS "tecnico_delete_own" ON time_entries;

-- 2. RECRIAR políticas com lógica corrigida

-- ✅ Política: Admin vê e edita TUDO
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

-- ✅ Política: Encarregado, Diretor, Logística veem TUDO (apenas leitura)
CREATE POLICY "management_read_all" ON time_entries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('encarregado', 'diretor', 'logistica')
    )
  );

-- ✅ Política: Técnicos veem APENAS seus próprios registos (por user_id)
CREATE POLICY "tecnico_read_own" ON time_entries
  FOR SELECT
  TO authenticated
  USING (
    -- Técnico vê apenas seus registos (filtro por user_id)
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'tecnico'
      AND time_entries.user_id = auth.uid()
    )
  );

-- ✅ Política: Técnicos podem INSERIR apenas seus próprios registos
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

-- ✅ Política: Técnicos podem ATUALIZAR apenas seus próprios registos
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

-- ✅ Política: Técnicos podem APAGAR apenas seus próprios registos
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

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
SELECT
  'Políticas recriadas com sucesso!' as status,
  COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'time_entries';

-- Listar políticas
SELECT policyname, cmd FROM pg_policies
WHERE tablename = 'time_entries'
ORDER BY policyname;
