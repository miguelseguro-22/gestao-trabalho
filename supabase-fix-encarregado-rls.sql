-- =====================================================
-- CORREÇÃO CRÍTICA: Encarregado vê APENAS os seus registos
-- =====================================================
-- PROBLEMA: Encarregado estava na política "management_read_all"
--           dando-lhe acesso a TODOS os registos
-- SOLUÇÃO:  Encarregado deve ter as MESMAS permissões que técnico
--           (apenas ver seus próprios registos)

-- 1. REMOVER políticas antigas
DROP POLICY IF EXISTS "admin_all_access" ON time_entries;
DROP POLICY IF EXISTS "management_read_all" ON time_entries;
DROP POLICY IF EXISTS "tecnico_read_own" ON time_entries;
DROP POLICY IF EXISTS "tecnico_insert_own" ON time_entries;
DROP POLICY IF EXISTS "tecnico_update_own" ON time_entries;
DROP POLICY IF EXISTS "tecnico_delete_own" ON time_entries;
DROP POLICY IF EXISTS "encarregado_read_own" ON time_entries;
DROP POLICY IF EXISTS "encarregado_insert_own" ON time_entries;
DROP POLICY IF EXISTS "encarregado_update_own" ON time_entries;
DROP POLICY IF EXISTS "encarregado_delete_own" ON time_entries;

-- 2. RECRIAR políticas com lógica CORRIGIDA

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

-- ✅ Política: Diretor e Logística veem TUDO (apenas leitura)
-- ⚠️ ENCARREGADO NÃO ESTÁ AQUI! (foi removido)
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

-- ✅ Política: Técnicos veem APENAS seus próprios registos (por user_id)
CREATE POLICY "tecnico_read_own" ON time_entries
  FOR SELECT
  TO authenticated
  USING (
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

-- ✅✅✅ NOVAS POLÍTICAS PARA ENCARREGADO ✅✅✅
-- Encarregado tem as MESMAS permissões que técnico
-- (a diferença é apenas no frontend: acesso à página "materiais")

-- ✅ Política: Encarregados veem APENAS seus próprios registos (por user_id)
CREATE POLICY "encarregado_read_own" ON time_entries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'encarregado'
      AND time_entries.user_id = auth.uid()
    )
  );

-- ✅ Política: Encarregados podem INSERIR apenas seus próprios registos
CREATE POLICY "encarregado_insert_own" ON time_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'encarregado'
    )
    AND user_id = auth.uid()
  );

-- ✅ Política: Encarregados podem ATUALIZAR apenas seus próprios registos
CREATE POLICY "encarregado_update_own" ON time_entries
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'encarregado'
    )
    AND user_id = auth.uid()
  )
  WITH CHECK (
    user_id = auth.uid()
  );

-- ✅ Política: Encarregados podem APAGAR apenas seus próprios registos
CREATE POLICY "encarregado_delete_own" ON time_entries
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'encarregado'
    )
    AND user_id = auth.uid()
  );

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
SELECT
  '✅ Políticas recriadas com sucesso!' as status,
  'Encarregado agora tem as MESMAS permissões que técnico' as nota,
  COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'time_entries';

-- Listar políticas
SELECT
  policyname,
  cmd,
  CASE
    WHEN policyname LIKE '%admin%' THEN '🔓 Admin (TUDO)'
    WHEN policyname LIKE '%management%' THEN '🔓 Diretor/Logística (TUDO)'
    WHEN policyname LIKE '%tecnico%' THEN '🔒 Técnico (PRÓPRIOS)'
    WHEN policyname LIKE '%encarregado%' THEN '🔒 Encarregado (PRÓPRIOS)'
  END as tipo_acesso
FROM pg_policies
WHERE tablename = 'time_entries'
ORDER BY policyname;
