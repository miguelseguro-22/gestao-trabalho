-- =====================================================
-- 🔍 DIAGNÓSTICO COMPLETO: Porquê timeEntries está vazio?
-- =====================================================

-- PASSO 1: Ver quantos registros existem na tabela time_entries
SELECT
  '📊 Registros na tabela time_entries' as diagnostico,
  COUNT(*) as total_registros
FROM time_entries;

-- PASSO 2: Ver alguns exemplos de dados
SELECT
  '📋 Exemplos de dados (primeiros 5)' as diagnostico,
  id,
  date,
  worker,
  template,
  hours,
  project
FROM time_entries
ORDER BY created_at DESC
LIMIT 5;

-- PASSO 3: Ver o que está no payload do shared
SELECT
  '🔍 Conteúdo do payload shared' as diagnostico,
  id,
  jsonb_pretty(payload) as payload_formatado
FROM app_state
WHERE id = 'shared';

-- PASSO 4: Ver todas as chaves no payload
SELECT
  '🔑 Chaves no payload shared' as diagnostico,
  jsonb_object_keys(payload) as chave
FROM app_state
WHERE id = 'shared';

-- PASSO 5: Ver especificamente o timeEntries
SELECT
  '⏱️ Conteúdo de timeEntries' as diagnostico,
  id,
  payload->'timeEntries' as timeentries_content,
  jsonb_array_length(payload->'timeEntries') as total
FROM app_state
WHERE id = 'shared';

-- =====================================================
-- 🔥 SOLUÇÃO: Popular timeEntries COM FORÇA!
-- =====================================================

DO $$
DECLARE
  entries_array JSONB := '[]'::jsonb;
  entry_record RECORD;
  total_entries INT := 0;
  current_payload JSONB;
BEGIN
  RAISE NOTICE '🔍 A procurar dados na tabela time_entries...';

  -- Contar quantos registros temos
  SELECT COUNT(*) INTO total_entries FROM time_entries;
  RAISE NOTICE '📊 Total de registros em time_entries: %', total_entries;

  -- Se não houver registros, criar um de teste
  IF total_entries = 0 THEN
    RAISE NOTICE '⚠️ AVISO: Não há registros em time_entries!';
    RAISE NOTICE '💡 Vou criar array vazio para evitar null';
    entries_array := '[]'::jsonb;
  ELSE
    -- Buscar TODOS os registros
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
      -- Adicionar cada registro ao array
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
    END LOOP;

    RAISE NOTICE '✅ Preparados % registros para o payload', jsonb_array_length(entries_array);
  END IF;

  -- Obter payload atual
  SELECT payload INTO current_payload FROM app_state WHERE id = 'shared';

  -- Se não existir payload, criar do zero
  IF current_payload IS NULL THEN
    current_payload := '{}'::jsonb;
  END IF;

  -- FORÇAR atualização do timeEntries
  current_payload := jsonb_set(current_payload, '{timeEntries}', entries_array, true);
  current_payload := jsonb_set(current_payload, '{updatedAt}', to_jsonb(NOW()::text), true);

  -- Atualizar na BD
  UPDATE app_state
  SET
    payload = current_payload,
    updated_at = NOW()
  WHERE id = 'shared';

  RAISE NOTICE '🎉 timeEntries atualizado com % registros!', jsonb_array_length(entries_array);
END $$;

-- =====================================================
-- ✅ VERIFICAÇÃO FINAL
-- =====================================================
SELECT
  '🎯 RESULTADO FINAL' as status,
  id,
  payload ? 'timeEntries' as campo_existe,
  jsonb_typeof(payload->'timeEntries') as tipo,
  jsonb_array_length(payload->'timeEntries') as total_registros,
  updated_at
FROM app_state
WHERE id = 'shared';

-- Ver primeiros 3 registros do timeEntries (se houver)
SELECT
  '📋 Primeiros registros em timeEntries' as info,
  jsonb_array_elements(payload->'timeEntries') as registro
FROM app_state
WHERE id = 'shared'
LIMIT 3;
