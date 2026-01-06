-- =====================================================
-- FIX: Inicializar timeEntries no app_state shared
-- =====================================================
-- Este script diagnostica e corrige o problema do campo
-- timeEntries estar null no registro 'shared'

-- =====================================================
-- PASSO 1: DIAGNÓSTICO - Ver estado atual
-- =====================================================
SELECT '=== DIAGNÓSTICO DO PROBLEMA ===' as status;

-- Ver se o registro shared existe
SELECT
  id,
  CASE
    WHEN payload IS NULL THEN '❌ Payload é NULL'
    WHEN payload ? 'timeEntries' THEN '✅ Campo timeEntries existe'
    ELSE '❌ Campo timeEntries NÃO existe'
  END as status_timeentries,
  jsonb_typeof(payload->'timeEntries') as tipo_timeentries,
  jsonb_array_length(payload->'timeEntries') as total_registos,
  updated_at,
  LENGTH(payload::text) as tamanho_payload_bytes
FROM app_state
WHERE id = 'shared';

-- Ver as chaves que existem no payload
SELECT
  'Chaves no payload:' as info,
  jsonb_object_keys(payload) as chave
FROM app_state
WHERE id = 'shared';

-- =====================================================
-- PASSO 2: CORREÇÃO - Inicializar timeEntries
-- =====================================================
SELECT '=== APLICANDO CORREÇÃO ===' as status;

-- Opção A: Se o registro shared NÃO existe, criar do zero
INSERT INTO app_state (id, payload, updated_at)
VALUES (
  'shared',
  jsonb_build_object(
    'timeEntries', '[]'::jsonb,
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
  ),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Opção B: Se já existe mas não tem timeEntries, adicionar
UPDATE app_state
SET
  payload = CASE
    -- Se payload é null, criar estrutura completa
    WHEN payload IS NULL THEN jsonb_build_object(
      'timeEntries', '[]'::jsonb,
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
    )
    -- Se payload existe mas não tem timeEntries, adicionar
    WHEN NOT (payload ? 'timeEntries') THEN
      jsonb_set(payload, '{timeEntries}', '[]'::jsonb)
    -- Se já tem timeEntries mas não é array, substituir por array vazio
    WHEN jsonb_typeof(payload->'timeEntries') != 'array' THEN
      jsonb_set(payload, '{timeEntries}', '[]'::jsonb)
    -- Caso contrário, manter como está
    ELSE payload
  END,
  updated_at = NOW()
WHERE id = 'shared';

-- =====================================================
-- PASSO 3: VERIFICAÇÃO - Confirmar correção
-- =====================================================
SELECT '=== VERIFICAÇÃO PÓS-CORREÇÃO ===' as status;

SELECT
  id,
  CASE
    WHEN payload ? 'timeEntries' AND jsonb_typeof(payload->'timeEntries') = 'array'
    THEN '✅ timeEntries OK (array vazio ou com dados)'
    ELSE '❌ Ainda há problemas'
  END as status_final,
  jsonb_array_length(payload->'timeEntries') as total_time_entries,
  updated_at
FROM app_state
WHERE id = 'shared';

-- =====================================================
-- PASSO 4 (OPCIONAL): Popular com dados de time_entries
-- =====================================================
-- Se quiser popular o timeEntries com dados da tabela time_entries:

/*
DO $$
DECLARE
  entries_array JSONB := '[]'::jsonb;
  entry_record RECORD;
BEGIN
  -- Buscar todos os registros de time_entries
  FOR entry_record IN
    SELECT
      id,
      user_id,
      date,
      template,
      hours,
      overtime,
      project,
      supervisor,
      worker,
      colaborador,
      displacement,
      period_start,
      period_end,
      sick_days,
      status,
      created_at,
      updated_at
    FROM time_entries
    ORDER BY date DESC
  LOOP
    -- Adicionar cada registro ao array JSON
    entries_array := entries_array || jsonb_build_object(
      'id', entry_record.id,
      'userId', entry_record.user_id,
      'date', entry_record.date,
      'template', entry_record.template,
      'hours', entry_record.hours,
      'overtime', entry_record.overtime,
      'project', entry_record.project,
      'supervisor', entry_record.supervisor,
      'worker', entry_record.worker,
      'colaborador', entry_record.colaborador,
      'displacement', entry_record.displacement,
      'periodStart', entry_record.period_start,
      'periodEnd', entry_record.period_end,
      'sickDays', entry_record.sick_days,
      'status', entry_record.status,
      'createdAt', entry_record.created_at,
      'updatedAt', entry_record.updated_at
    );
  END LOOP;

  -- Atualizar o shared com os dados
  UPDATE app_state
  SET
    payload = jsonb_set(payload, '{timeEntries}', entries_array),
    updated_at = NOW()
  WHERE id = 'shared';

  RAISE NOTICE '✅ Popular timeEntries: % registros adicionados', jsonb_array_length(entries_array);
END $$;
*/

-- =====================================================
-- RESULTADO FINAL
-- =====================================================
SELECT
  '✅ CORREÇÃO COMPLETA' as status,
  jsonb_array_length(payload->'timeEntries') as total_time_entries,
  updated_at
FROM app_state
WHERE id = 'shared';
