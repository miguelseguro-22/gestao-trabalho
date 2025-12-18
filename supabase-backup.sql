-- =====================================================
-- BACKUP E RESTAURO - TIME_ENTRIES
-- =====================================================
-- Use este script se a tabela time_entries JÁ EXISTE e queres fazer backup antes de recriar

-- =====================================================
-- PASSO 1: FAZER BACKUP DOS DADOS EXISTENTES
-- =====================================================

-- Criar tabela temporária para backup
CREATE TABLE IF NOT EXISTS time_entries_backup AS
SELECT * FROM time_entries;

-- Verificar quantos registos foram copiados
SELECT
  'Backup criado com sucesso!' as status,
  COUNT(*) as total_registos
FROM time_entries_backup;

-- =====================================================
-- PASSO 2: AGORA PODES EXECUTAR O supabase-schema.sql
-- =====================================================
-- O supabase-schema.sql vai fazer DROP da tabela time_entries
-- e criar uma nova com a estrutura correta

-- =====================================================
-- PASSO 3: RESTAURAR DADOS DO BACKUP (após executar schema)
-- =====================================================

-- Inserir dados do backup na nova tabela
-- NOTA: Apenas se a estrutura for compatível
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
  sick_days,
  status,
  created_at,
  updated_at
)
SELECT
  id,
  user_id,
  date,
  template,
  COALESCE(hours, 0),
  COALESCE(overtime, 0),
  project,
  supervisor,
  worker,
  displacement,
  period_start,
  period_end,
  sick_days,
  COALESCE(status, 'approved'),
  COALESCE(created_at, NOW()),
  COALESCE(updated_at, NOW())
FROM time_entries_backup
ON CONFLICT (id) DO NOTHING;

-- Verificar restauro
SELECT
  'Restauro completo!' as status,
  COUNT(*) as total_registos_restaurados
FROM time_entries;

-- =====================================================
-- PASSO 4: LIMPAR BACKUP (opcional - após confirmar dados)
-- =====================================================

-- ⚠️ SÓ EXECUTAR DEPOIS DE CONFIRMAR QUE OS DADOS ESTÃO OK!
-- DROP TABLE time_entries_backup;

-- =====================================================
-- ALTERNATIVA: EXPORTAR BACKUP PARA JSON
-- =====================================================

-- Se preferires, podes exportar os dados para JSON antes de fazer DROP:
-- (Executar no Supabase Dashboard → SQL Editor)

COPY (
  SELECT json_agg(row_to_json(time_entries.*))
  FROM time_entries
) TO '/tmp/time_entries_backup.json';

-- Ou usar a UI do Supabase:
-- Table Editor → time_entries → ... → Export to CSV
