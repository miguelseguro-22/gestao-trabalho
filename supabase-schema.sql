-- =====================================================
-- SCHEMA SUPABASE - GESTÃO DE TRABALHO
-- Backend Real para Registos de Horas
-- =====================================================

-- 1. TABELA DE REGISTOS DE TEMPO (Time Entries)
-- =====================================================
CREATE TABLE IF NOT EXISTS time_entries (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Dados do registo
  date DATE NOT NULL,
  template TEXT NOT NULL, -- 'Trabalho Normal', 'Férias', 'Baixa', 'Falta', etc.

  -- Horas
  hours DECIMAL(5,2) DEFAULT 0,
  overtime DECIMAL(5,2) DEFAULT 0,

  -- Projeto e supervisão
  project TEXT,
  supervisor TEXT,
  worker TEXT NOT NULL, -- Nome do colaborador
  colaborador TEXT, -- Campo alternativo

  -- Deslocação
  displacement TEXT, -- 'Sim' ou 'Não'

  -- Férias/Baixas (períodos)
  period_start DATE,
  period_end DATE,
  sick_days INTEGER,

  -- Status e aprovação
  status TEXT DEFAULT 'approved', -- 'pending', 'approved', 'rejected'

  -- Auditoria
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Metadata adicional (para flexibilidade futura)
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
CREATE INDEX IF NOT EXISTS idx_time_entries_worker ON time_entries(worker);
CREATE INDEX IF NOT EXISTS idx_time_entries_project ON time_entries(project);
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON time_entries(status);
CREATE INDEX IF NOT EXISTS idx_time_entries_created_at ON time_entries(created_at);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. ROW LEVEL SECURITY (RLS) - PERMISSÕES
-- =====================================================

-- Ativar RLS na tabela
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Política: Admin vê TUDO
CREATE POLICY "admin_all_access" ON time_entries
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Política: Encarregado, Diretor, Logística veem TUDO (apenas leitura ampla)
CREATE POLICY "management_read_all" ON time_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('encarregado', 'diretor', 'logistica')
    )
  );

-- Política: Técnicos veem APENAS seus próprios registos
CREATE POLICY "tecnico_own_data" ON time_entries
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR worker = (SELECT name FROM profiles WHERE id = auth.uid())
  );

-- Política: Técnicos podem INSERIR apenas seus próprios registos
CREATE POLICY "tecnico_insert_own" ON time_entries
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND worker = (SELECT name FROM profiles WHERE id = auth.uid())
  );

-- Política: Técnicos podem ATUALIZAR apenas seus próprios registos
CREATE POLICY "tecnico_update_own" ON time_entries
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Política: Técnicos podem APAGAR apenas seus próprios registos
CREATE POLICY "tecnico_delete_own" ON time_entries
  FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- 3. FUNÇÃO PARA MIGRAÇÃO DE DADOS (Opcional)
-- =====================================================
-- Esta função pode ser usada para migrar dados do app_state para time_entries

CREATE OR REPLACE FUNCTION migrate_app_state_to_time_entries()
RETURNS void AS $$
DECLARE
  state_record RECORD;
  entry JSONB;
BEGIN
  -- Iterar sobre todos os registos em app_state
  FOR state_record IN
    SELECT id, payload FROM app_state
    WHERE payload->>'timeEntries' IS NOT NULL
  LOOP
    -- Para cada entrada de tempo no payload
    FOR entry IN
      SELECT * FROM jsonb_array_elements(state_record.payload->'timeEntries')
    LOOP
      -- Inserir na nova tabela (se não existir)
      INSERT INTO time_entries (
        id,
        user_id,
        date,
        template,
        hours,
        overtime,
        project,
        supervisor,
        worker,
        displacement,
        period_start,
        period_end,
        status,
        created_at
      )
      SELECT
        COALESCE((entry->>'id')::uuid, gen_random_uuid()),
        -- Tentar extrair user_id do id do app_state (formato: user_<uuid>)
        CASE
          WHEN state_record.id LIKE 'user_%'
          THEN substring(state_record.id from 6)::uuid
          ELSE NULL
        END,
        (entry->>'date')::date,
        COALESCE(entry->>'template', 'Trabalho Normal'),
        COALESCE((entry->>'hours')::decimal, 0),
        COALESCE((entry->>'overtime')::decimal, 0),
        entry->>'project',
        entry->>'supervisor',
        COALESCE(entry->>'worker', entry->>'colaborador', 'Desconhecido'),
        entry->>'displacement',
        (entry->>'periodStart')::date,
        (entry->>'periodEnd')::date,
        COALESCE(entry->>'status', 'approved'),
        COALESCE((entry->>'created_at')::timestamptz, NOW())
      ON CONFLICT (id) DO NOTHING; -- Ignorar se já existir
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. VIEWS PARA RELATÓRIOS (Opcional - Performance)
-- =====================================================

-- View: Registos agrupados por colaborador e mês
CREATE OR REPLACE VIEW monthly_summary AS
SELECT
  user_id,
  worker,
  DATE_TRUNC('month', date) AS month,
  COUNT(*) AS total_entries,
  SUM(hours) AS total_hours,
  SUM(overtime) AS total_overtime,
  COUNT(*) FILTER (WHERE template = 'Férias') AS vacation_days,
  COUNT(*) FILTER (WHERE template = 'Baixa') AS sick_days,
  COUNT(*) FILTER (WHERE template = 'Falta') AS absence_days
FROM time_entries
GROUP BY user_id, worker, DATE_TRUNC('month', date);

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE time_entries IS 'Registos de tempo dos colaboradores - backend real para sync concorrente';
COMMENT ON COLUMN time_entries.user_id IS 'ID do utilizador que criou o registo (auth.users)';
COMMENT ON COLUMN time_entries.worker IS 'Nome do colaborador (deve corresponder a profiles.name)';
COMMENT ON COLUMN time_entries.template IS 'Tipo de registo: Trabalho Normal, Férias, Baixa, Falta, etc.';
COMMENT ON COLUMN time_entries.status IS 'Estado: pending (aguarda aprovação), approved, rejected';

-- =====================================================
-- NOTAS DE IMPLEMENTAÇÃO
-- =====================================================
--
-- 1. Criar esta estrutura no Supabase SQL Editor
-- 2. Executar migrate_app_state_to_time_entries() para migrar dados existentes
-- 3. Modificar App.tsx para usar esta tabela em vez de app_state
-- 4. Manter app_state para outros dados (projects, orders, catalog, etc.)
-- 5. Apenas time_entries vai para a nova tabela
--
-- VANTAGENS:
-- - ✅ Sync concorrente sem conflitos
-- - ✅ 20+ utilizadores ao mesmo tempo
-- - ✅ Permissões granulares por registo
-- - ✅ Auditoria completa (created_by, updated_by)
-- - ✅ Performance otimizada (índices)
-- - ✅ Queries eficientes (filtrar apenas data necessária)
--
