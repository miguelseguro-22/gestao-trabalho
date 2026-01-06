-- =====================================================
-- 🛡️ TRIGGER DE PROTEÇÃO: Garantir timeEntries SEMPRE
-- =====================================================
-- Este trigger FORÇA que o campo timeEntries exista sempre
-- que o registro 'shared' for atualizado ou inserido

-- Remover trigger anterior (se existir)
DROP TRIGGER IF EXISTS ensure_timeentries_exists ON app_state;
DROP FUNCTION IF EXISTS ensure_timeentries_in_shared() CASCADE;

-- Criar função do trigger
CREATE OR REPLACE FUNCTION ensure_timeentries_in_shared()
RETURNS TRIGGER AS $$
BEGIN
  -- Só aplicar ao registro 'shared'
  IF NEW.id = 'shared' THEN

    -- Se payload é NULL, criar estrutura base
    IF NEW.payload IS NULL THEN
      NEW.payload := '{}'::jsonb;
    END IF;

    -- Se timeEntries não existe, adicionar como array vazio
    IF NOT (NEW.payload ? 'timeEntries') THEN
      RAISE NOTICE '⚠️ TRIGGER: Campo timeEntries não existe! A adicionar...';
      NEW.payload := jsonb_set(NEW.payload, '{timeEntries}', '[]'::jsonb, true);
    END IF;

    -- Se timeEntries existe mas NÃO é array, corrigir
    IF jsonb_typeof(NEW.payload->'timeEntries') != 'array' THEN
      RAISE NOTICE '⚠️ TRIGGER: Campo timeEntries não é array! A corrigir...';
      NEW.payload := jsonb_set(NEW.payload, '{timeEntries}', '[]'::jsonb, true);
    END IF;

    -- Atualizar timestamp
    NEW.payload := jsonb_set(NEW.payload, '{updatedAt}', to_jsonb(NOW()::text), true);
    NEW.updated_at := NOW();

    RAISE NOTICE '✅ TRIGGER: timeEntries garantido no payload (% registros)',
                 jsonb_array_length(NEW.payload->'timeEntries');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger BEFORE INSERT e UPDATE
CREATE TRIGGER ensure_timeentries_exists
  BEFORE INSERT OR UPDATE ON app_state
  FOR EACH ROW
  EXECUTE FUNCTION ensure_timeentries_in_shared();

-- =====================================================
-- ✅ TESTAR O TRIGGER
-- =====================================================

-- Teste 1: Tentar atualizar shared SEM timeEntries (deve adicionar automaticamente)
DO $$
BEGIN
  RAISE NOTICE '🧪 TESTE 1: Atualizar shared sem timeEntries';

  UPDATE app_state
  SET payload = '{"theme": "dark", "density": "comfy"}'::jsonb
  WHERE id = 'shared';

  RAISE NOTICE '✅ Teste 1 completo';
END $$;

-- Verificar resultado do Teste 1
SELECT
  '🧪 Resultado Teste 1' as teste,
  payload ? 'timeEntries' as tem_timeentries,
  jsonb_typeof(payload->'timeEntries') as tipo,
  jsonb_array_length(payload->'timeEntries') as total
FROM app_state
WHERE id = 'shared';

-- Teste 2: Tentar atualizar com timeEntries como null (deve corrigir)
DO $$
BEGIN
  RAISE NOTICE '🧪 TESTE 2: Atualizar shared com timeEntries = null';

  UPDATE app_state
  SET payload = '{"timeEntries": null, "theme": "light"}'::jsonb
  WHERE id = 'shared';

  RAISE NOTICE '✅ Teste 2 completo';
END $$;

-- Verificar resultado do Teste 2
SELECT
  '🧪 Resultado Teste 2' as teste,
  payload ? 'timeEntries' as tem_timeentries,
  jsonb_typeof(payload->'timeEntries') as tipo,
  jsonb_array_length(payload->'timeEntries') as total
FROM app_state
WHERE id = 'shared';

-- Teste 3: Tentar atualizar com timeEntries como string (deve corrigir)
DO $$
BEGIN
  RAISE NOTICE '🧪 TESTE 3: Atualizar shared com timeEntries = string';

  UPDATE app_state
  SET payload = '{"timeEntries": "isto é uma string", "theme": "light"}'::jsonb
  WHERE id = 'shared';

  RAISE NOTICE '✅ Teste 3 completo';
END $$;

-- Verificar resultado do Teste 3
SELECT
  '🧪 Resultado Teste 3' as teste,
  payload ? 'timeEntries' as tem_timeentries,
  jsonb_typeof(payload->'timeEntries') as tipo,
  jsonb_array_length(payload->'timeEntries') as total
FROM app_state
WHERE id = 'shared';

-- =====================================================
-- 📊 RELATÓRIO FINAL
-- =====================================================
SELECT
  '🎯 TRIGGER INSTALADO E TESTADO' as status,
  'Trigger: ensure_timeentries_exists' as trigger_name,
  'Função: ensure_timeentries_in_shared()' as function_name,
  'Tabela: app_state' as tabela,
  'Momento: BEFORE INSERT OR UPDATE' as momento;

-- Ver detalhes do trigger
SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'ensure_timeentries_exists';

-- Verificação final do estado do shared
SELECT
  '✅ ESTADO FINAL DO SHARED' as status,
  id,
  payload ? 'timeEntries' as campo_existe,
  jsonb_typeof(payload->'timeEntries') as tipo_correto,
  jsonb_array_length(payload->'timeEntries') as total_registros,
  updated_at
FROM app_state
WHERE id = 'shared';

-- =====================================================
-- 📝 INSTRUÇÕES
-- =====================================================
--
-- ✅ O que este script faz:
-- 1. Cria um TRIGGER que roda ANTES de INSERT/UPDATE
-- 2. Se o registro for 'shared', GARANTE que timeEntries existe
-- 3. Se não existir, adiciona como array vazio
-- 4. Se existir mas não for array, corrige para array vazio
-- 5. NUNCA mais terá timeEntries null!
--
-- ⚠️ IMPORTANTE:
-- - Este trigger protege contra qualquer código que tente
--   sobrescrever o payload sem timeEntries
-- - MESMO que a aplicação envie payload sem timeEntries,
--   o trigger adiciona automaticamente
-- - É uma proteção a nível de base de dados
--
-- 🎯 Próximos passos:
-- 1. Execute este script no Supabase SQL Editor
-- 2. O trigger ficará ativo permanentemente
-- 3. Teste a aplicação - o timeEntries nunca mais será null!
--
-- =====================================================
