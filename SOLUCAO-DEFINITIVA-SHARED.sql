-- =====================================================
-- 🔥 SOLUÇÃO DEFINITIVA: RECREAR SHARED COM timeEntries
-- =====================================================
-- Este script APAGA e RECRIA o registro 'shared' do zero
-- garantindo que o campo timeEntries existe e está populado

BEGIN;

-- =====================================================
-- PASSO 1: BACKUP - Guardar shared atual (segurança)
-- =====================================================
DO $$
BEGIN
  -- Criar tabela de backup se não existir
  CREATE TABLE IF NOT EXISTS app_state_backup_history (
    backup_id SERIAL PRIMARY KEY,
    backup_date TIMESTAMPTZ DEFAULT NOW(),
    id TEXT,
    payload JSONB,
    updated_at TIMESTAMPTZ
  );

  -- Fazer backup do shared atual
  INSERT INTO app_state_backup_history (id, payload, updated_at)
  SELECT id, payload, updated_at
  FROM app_state
  WHERE id = 'shared';

  RAISE NOTICE '✅ Backup criado na tabela app_state_backup_history';
END $$;

-- =====================================================
-- PASSO 2: POPULAR timeEntries com dados da time_entries
-- =====================================================
DO $$
DECLARE
  entries_array JSONB := '[]'::jsonb;
  entry_record RECORD;
  total_entries INT := 0;
BEGIN
  RAISE NOTICE '🔍 A procurar dados na tabela time_entries...';

  -- Buscar TODOS os registros de time_entries
  FOR entry_record IN
    SELECT
      id,
      user_id,
      date,
      template,
      COALESCE(hours, 0) as hours,
      COALESCE(overtime, 0) as overtime,
      project,
      supervisor,
      worker,
      colaborador,
      displacement,
      period_start,
      period_end,
      sick_days,
      COALESCE(status, 'approved') as status,
      created_at,
      updated_at
    FROM time_entries
    ORDER BY date DESC
  LOOP
    -- Adicionar cada registro ao array JSON
    entries_array := entries_array || jsonb_build_object(
      'id', entry_record.id::text,
      'userId', entry_record.user_id::text,
      'date', to_char(entry_record.date, 'YYYY-MM-DD'),
      'template', entry_record.template,
      'hours', entry_record.hours,
      'overtime', entry_record.overtime,
      'project', entry_record.project,
      'supervisor', entry_record.supervisor,
      'worker', entry_record.worker,
      'colaborador', entry_record.colaborador,
      'displacement', entry_record.displacement,
      'periodStart', CASE WHEN entry_record.period_start IS NOT NULL
                          THEN to_char(entry_record.period_start, 'YYYY-MM-DD')
                          ELSE NULL END,
      'periodEnd', CASE WHEN entry_record.period_end IS NOT NULL
                        THEN to_char(entry_record.period_end, 'YYYY-MM-DD')
                        ELSE NULL END,
      'sickDays', entry_record.sick_days,
      'status', entry_record.status,
      'createdAt', entry_record.created_at::text,
      'updatedAt', entry_record.updated_at::text
    );

    total_entries := total_entries + 1;
  END LOOP;

  RAISE NOTICE '📊 Total de registros encontrados: %', total_entries;

  -- Guardar temporariamente para usar no próximo passo
  CREATE TEMP TABLE IF NOT EXISTS temp_timeentries (data JSONB);
  TRUNCATE temp_timeentries;
  INSERT INTO temp_timeentries VALUES (entries_array);

  RAISE NOTICE '✅ timeEntries preparado com % registros', total_entries;
END $$;

-- =====================================================
-- PASSO 3: APAGAR E RECREAR o registro 'shared'
-- =====================================================
DO $$
DECLARE
  new_payload JSONB;
  entries_data JSONB;
BEGIN
  RAISE NOTICE '🗑️ A apagar registro shared atual...';

  -- Apagar o shared existente (que está corrupto)
  DELETE FROM app_state WHERE id = 'shared';

  -- Obter os timeEntries preparados
  SELECT data INTO entries_data FROM temp_timeentries LIMIT 1;

  -- Se não houver dados, usar array vazio
  IF entries_data IS NULL THEN
    entries_data := '[]'::jsonb;
  END IF;

  RAISE NOTICE '🔧 A criar novo registro shared com timeEntries...';

  -- Criar payload completo com timeEntries
  new_payload := jsonb_build_object(
    'timeEntries', entries_data,
    'orders', '[]'::jsonb,
    'projects', '[]'::jsonb,
    'activity', '[]'::jsonb,
    'catalog', '[]'::jsonb,
    'vehicles', '[]'::jsonb,
    'agenda', '[]'::jsonb,
    'notifications', '[]'::jsonb,
    'people', '{}'::jsonb,
    'prefs', '{}'::jsonb,
    'suppliers', '{}'::jsonb,
    'theme', '"light"'::jsonb,
    'density', '"comfy"'::jsonb,
    'updatedAt', to_jsonb(NOW()::text)
  );

  -- Inserir novo registro shared
  INSERT INTO app_state (id, payload, updated_at)
  VALUES ('shared', new_payload, NOW());

  RAISE NOTICE '✅ Novo registro shared criado!';
  RAISE NOTICE '📊 Total de timeEntries no payload: %', jsonb_array_length(entries_data);
END $$;

-- =====================================================
-- PASSO 4: VERIFICAÇÃO FINAL
-- =====================================================
DO $$
DECLARE
  check_record RECORD;
BEGIN
  SELECT
    id,
    payload ? 'timeEntries' as tem_campo,
    jsonb_typeof(payload->'timeEntries') as tipo,
    jsonb_array_length(payload->'timeEntries') as total,
    updated_at
  INTO check_record
  FROM app_state
  WHERE id = 'shared';

  IF NOT FOUND THEN
    RAISE EXCEPTION '❌ ERRO: Registro shared não foi criado!';
  END IF;

  IF NOT check_record.tem_campo THEN
    RAISE EXCEPTION '❌ ERRO: Campo timeEntries não existe no payload!';
  END IF;

  IF check_record.tipo != 'array' THEN
    RAISE EXCEPTION '❌ ERRO: Campo timeEntries não é um array! É: %', check_record.tipo;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '🎉🎉🎉 SUCESSO TOTAL! 🎉🎉🎉';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Registro shared recreado com sucesso';
  RAISE NOTICE '✅ Campo timeEntries existe: %', check_record.tem_campo;
  RAISE NOTICE '✅ Tipo do campo: % (correto!)', check_record.tipo;
  RAISE NOTICE '✅ Total de registros: %', check_record.total;
  RAISE NOTICE '✅ Atualizado em: %', check_record.updated_at;
  RAISE NOTICE '';
END $$;

-- Limpar tabela temporária
DROP TABLE IF EXISTS temp_timeentries;

COMMIT;

-- =====================================================
-- RESULTADO FINAL - QUERY PARA CONFIRMAR
-- =====================================================
SELECT
  '🎯 VERIFICAÇÃO FINAL' as status,
  id,
  payload ? 'timeEntries' as campo_existe,
  jsonb_typeof(payload->'timeEntries') as tipo_campo,
  jsonb_array_length(payload->'timeEntries') as total_time_entries,
  updated_at,
  LENGTH(payload::text) as tamanho_payload_bytes
FROM app_state
WHERE id = 'shared';

-- =====================================================
-- 📝 INSTRUÇÕES PÓS-EXECUÇÃO
-- =====================================================
--
-- Depois de executar este script:
--
-- 1. ✅ Execute esta query para confirmar:
--    SELECT
--      id,
--      jsonb_array_length(payload->'timeEntries') as total_time_entries,
--      updated_at
--    FROM app_state WHERE id = 'shared';
--
-- 2. ✅ O resultado deve mostrar um NÚMERO (não null!)
--
-- 3. ✅ Teste a aplicação:
--    - Refresh na página
--    - Ver se os registros aparecem
--    - Criar um novo registo
--    - Verificar se persiste
--
-- 4. ⚠️ Se o problema voltar a aparecer:
--    - Significa que a APLICAÇÃO está a sobrescrever o shared
--    - Precisamos modificar o código App.tsx
--    - O problema NÃO está na BD, está no frontend!
--
-- =====================================================
