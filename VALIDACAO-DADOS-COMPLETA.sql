-- =====================================================
-- 🔍 VALIDAÇÃO COMPLETA DE DADOS NO APP_STATE
-- =====================================================
-- Este script verifica que TODOS os dados estão a ser
-- guardados corretamente no Supabase app_state

-- =====================================================
-- 📊 PASSO 1: VERIFICAR ESTRUTURA DO PAYLOAD
-- =====================================================
SELECT '=== ESTRUTURA DO PAYLOAD ===' as info;

-- Ver TODAS as chaves no payload
SELECT
  'Chaves presentes no payload:' as info,
  jsonb_object_keys(payload) as chave
FROM app_state
WHERE id = 'shared'
ORDER BY chave;

-- =====================================================
-- 📈 PASSO 2: CONTAR REGISTROS EM CADA CAMPO
-- =====================================================
SELECT '=== CONTAGEM DE REGISTROS ===' as info;

SELECT
  id,
  -- Arrays
  CASE WHEN payload ? 'timeEntries'
       THEN jsonb_array_length(payload->'timeEntries')
       ELSE NULL END as total_timeentries,

  CASE WHEN payload ? 'orders'
       THEN jsonb_array_length(payload->'orders')
       ELSE NULL END as total_orders,

  CASE WHEN payload ? 'projects'
       THEN jsonb_array_length(payload->'projects')
       ELSE NULL END as total_projects,

  CASE WHEN payload ? 'activity'
       THEN jsonb_array_length(payload->'activity')
       ELSE NULL END as total_activity,

  CASE WHEN payload ? 'catalog'
       THEN jsonb_array_length(payload->'catalog')
       ELSE NULL END as total_catalog,

  CASE WHEN payload ? 'vehicles'
       THEN jsonb_array_length(payload->'vehicles')
       ELSE NULL END as total_vehicles,

  CASE WHEN payload ? 'agenda'
       THEN jsonb_array_length(payload->'agenda')
       ELSE NULL END as total_agenda,

  CASE WHEN payload ? 'notifications'
       THEN jsonb_array_length(payload->'notifications')
       ELSE NULL END as total_notifications,

  -- Objetos (contagem de chaves)
  CASE WHEN payload ? 'people'
       THEN (SELECT COUNT(*) FROM jsonb_object_keys(payload->'people'))
       ELSE 0 END as total_people,

  CASE WHEN payload ? 'suppliers'
       THEN (SELECT COUNT(*) FROM jsonb_object_keys(payload->'suppliers'))
       ELSE 0 END as total_suppliers,

  CASE WHEN payload ? 'prefs'
       THEN 'OK'
       ELSE 'MISSING' END as prefs_status,

  -- Strings
  payload->>'theme' as theme,
  payload->>'density' as density,
  payload->>'updatedAt' as last_update,

  updated_at as db_updated_at
FROM app_state
WHERE id = 'shared';

-- =====================================================
-- ✅ PASSO 3: VERIFICAR CAMPOS OBRIGATÓRIOS
-- =====================================================
SELECT '=== VERIFICAÇÃO DE CAMPOS OBRIGATÓRIOS ===' as info;

DO $$
DECLARE
  missing_fields TEXT[] := ARRAY[]::TEXT[];
  payload_data JSONB;
BEGIN
  -- Buscar payload
  SELECT payload INTO payload_data
  FROM app_state
  WHERE id = 'shared';

  -- Verificar cada campo obrigatório
  IF NOT (payload_data ? 'timeEntries') THEN
    missing_fields := array_append(missing_fields, 'timeEntries');
  END IF;

  IF NOT (payload_data ? 'orders') THEN
    missing_fields := array_append(missing_fields, 'orders');
  END IF;

  IF NOT (payload_data ? 'projects') THEN
    missing_fields := array_append(missing_fields, 'projects');
  END IF;

  IF NOT (payload_data ? 'activity') THEN
    missing_fields := array_append(missing_fields, 'activity');
  END IF;

  IF NOT (payload_data ? 'catalog') THEN
    missing_fields := array_append(missing_fields, 'catalog');
  END IF;

  IF NOT (payload_data ? 'people') THEN
    missing_fields := array_append(missing_fields, 'people');
  END IF;

  IF NOT (payload_data ? 'prefs') THEN
    missing_fields := array_append(missing_fields, 'prefs');
  END IF;

  IF NOT (payload_data ? 'vehicles') THEN
    missing_fields := array_append(missing_fields, 'vehicles');
  END IF;

  IF NOT (payload_data ? 'agenda') THEN
    missing_fields := array_append(missing_fields, 'agenda');
  END IF;

  IF NOT (payload_data ? 'suppliers') THEN
    missing_fields := array_append(missing_fields, 'suppliers');
  END IF;

  IF NOT (payload_data ? 'notifications') THEN
    missing_fields := array_append(missing_fields, 'notifications');
  END IF;

  IF NOT (payload_data ? 'theme') THEN
    missing_fields := array_append(missing_fields, 'theme');
  END IF;

  IF NOT (payload_data ? 'density') THEN
    missing_fields := array_append(missing_fields, 'density');
  END IF;

  -- Relatório
  IF array_length(missing_fields, 1) > 0 THEN
    RAISE WARNING '❌ CAMPOS EM FALTA: %', array_to_string(missing_fields, ', ');
  ELSE
    RAISE NOTICE '✅ TODOS OS CAMPOS OBRIGATÓRIOS PRESENTES!';
  END IF;
END $$;

-- =====================================================
-- 🔍 PASSO 4: VERIFICAR TIPOS DOS CAMPOS
-- =====================================================
SELECT '=== VERIFICAÇÃO DE TIPOS ===' as info;

SELECT
  id,
  -- Arrays devem ser type 'array'
  CASE WHEN jsonb_typeof(payload->'timeEntries') = 'array'
       THEN '✅' ELSE '❌ ' || jsonb_typeof(payload->'timeEntries') END as timeentries_type,

  CASE WHEN jsonb_typeof(payload->'orders') = 'array'
       THEN '✅' ELSE '❌ ' || jsonb_typeof(payload->'orders') END as orders_type,

  CASE WHEN jsonb_typeof(payload->'projects') = 'array'
       THEN '✅' ELSE '❌ ' || jsonb_typeof(payload->'projects') END as projects_type,

  CASE WHEN jsonb_typeof(payload->'activity') = 'array'
       THEN '✅' ELSE '❌ ' || jsonb_typeof(payload->'activity') END as activity_type,

  CASE WHEN jsonb_typeof(payload->'catalog') = 'array'
       THEN '✅' ELSE '❌ ' || jsonb_typeof(payload->'catalog') END as catalog_type,

  CASE WHEN jsonb_typeof(payload->'vehicles') = 'array'
       THEN '✅' ELSE '❌ ' || jsonb_typeof(payload->'vehicles') END as vehicles_type,

  CASE WHEN jsonb_typeof(payload->'agenda') = 'array'
       THEN '✅' ELSE '❌ ' || jsonb_typeof(payload->'agenda') END as agenda_type,

  CASE WHEN jsonb_typeof(payload->'notifications') = 'array'
       THEN '✅' ELSE '❌ ' || jsonb_typeof(payload->'notifications') END as notifications_type,

  -- Objetos devem ser type 'object'
  CASE WHEN jsonb_typeof(payload->'people') = 'object'
       THEN '✅' ELSE '❌ ' || jsonb_typeof(payload->'people') END as people_type,

  CASE WHEN jsonb_typeof(payload->'suppliers') = 'object'
       THEN '✅' ELSE '❌ ' || jsonb_typeof(payload->'suppliers') END as suppliers_type,

  CASE WHEN jsonb_typeof(payload->'prefs') = 'object'
       THEN '✅' ELSE '❌ ' || jsonb_typeof(payload->'prefs') END as prefs_type,

  -- Strings devem ser type 'string'
  CASE WHEN jsonb_typeof(payload->'theme') = 'string'
       THEN '✅' ELSE '❌ ' || jsonb_typeof(payload->'theme') END as theme_type,

  CASE WHEN jsonb_typeof(payload->'density') = 'string'
       THEN '✅' ELSE '❌ ' || jsonb_typeof(payload->'density') END as density_type

FROM app_state
WHERE id = 'shared';

-- =====================================================
-- 📦 PASSO 5: EXEMPLOS DE DADOS (primeiros registros)
-- =====================================================
SELECT '=== EXEMPLOS DE DADOS ===' as info;

-- Primeiros 3 timeEntries
SELECT
  '⏱️ TimeEntries (3 primeiros):' as tipo,
  jsonb_pretty(elem) as dados
FROM (
  SELECT jsonb_array_elements(payload->'timeEntries') as elem
  FROM app_state
  WHERE id = 'shared'
  LIMIT 3
) sub;

-- Primeiros 3 projects
SELECT
  '🏗️ Projects (3 primeiros):' as tipo,
  jsonb_pretty(elem) as dados
FROM (
  SELECT jsonb_array_elements(payload->'projects') as elem
  FROM app_state
  WHERE id = 'shared'
  LIMIT 3
) sub;

-- Colaboradores (people)
SELECT
  '👥 People (chaves):' as tipo,
  jsonb_object_keys(payload->'people') as colaborador
FROM app_state
WHERE id = 'shared'
LIMIT 5;

-- =====================================================
-- 📊 PASSO 6: TAMANHO DO PAYLOAD
-- =====================================================
SELECT '=== TAMANHO DO PAYLOAD ===' as info;

SELECT
  id,
  LENGTH(payload::text) as tamanho_bytes,
  ROUND(LENGTH(payload::text)::numeric / 1024, 2) as tamanho_kb,
  ROUND(LENGTH(payload::text)::numeric / 1024 / 1024, 2) as tamanho_mb,
  updated_at
FROM app_state
WHERE id = 'shared';

-- =====================================================
-- ✅ PASSO 7: RELATÓRIO FINAL
-- =====================================================
SELECT '=== RELATÓRIO FINAL ===' as info;

DO $$
DECLARE
  total_campos INT := 0;
  campos_ok INT := 0;
  payload_data JSONB;
  field TEXT;
  required_fields TEXT[] := ARRAY[
    'timeEntries', 'orders', 'projects', 'activity', 'catalog',
    'people', 'prefs', 'vehicles', 'agenda', 'suppliers',
    'notifications', 'theme', 'density'
  ];
BEGIN
  SELECT payload INTO payload_data
  FROM app_state
  WHERE id = 'shared';

  total_campos := array_length(required_fields, 1);

  FOREACH field IN ARRAY required_fields
  LOOP
    IF payload_data ? field THEN
      campos_ok := campos_ok + 1;
    END IF;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════╗';
  RAISE NOTICE '║     RELATÓRIO DE VALIDAÇÃO FINAL       ║';
  RAISE NOTICE '╠════════════════════════════════════════╣';
  RAISE NOTICE '║ Total de campos obrigatórios: %        ║', total_campos;
  RAISE NOTICE '║ Campos presentes: %                    ║', campos_ok;
  RAISE NOTICE '║ Campos em falta: %                     ║', (total_campos - campos_ok);
  RAISE NOTICE '╠════════════════════════════════════════╣';

  IF campos_ok = total_campos THEN
    RAISE NOTICE '║ STATUS: ✅ TODOS OS DADOS VALIDADOS!  ║';
  ELSE
    RAISE NOTICE '║ STATUS: ❌ DADOS INCOMPLETOS!         ║';
  END IF;

  RAISE NOTICE '╚════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- 📝 INSTRUÇÕES DE USO
-- =====================================================
--
-- Execute este script periodicamente para garantir que
-- todos os dados estão a ser guardados corretamente.
--
-- ✅ O QUE VERIFICAR:
-- 1. Todas as chaves devem estar presentes
-- 2. Todos os tipos devem estar corretos (✅ verde)
-- 3. Contagens devem refletir os dados da aplicação
-- 4. Timestamp updated_at deve ser recente
--
-- ⚠️ SE ENCONTRAR PROBLEMAS:
-- 1. Verifique se a aplicação está online
-- 2. Force sync manual (botão "☁️ Enviar para Cloud")
-- 3. Verifique logs do browser (F12 > Console)
-- 4. Execute o script TRIGGER-PROTECAO-TIMEENTRIES.sql
--
-- =====================================================
