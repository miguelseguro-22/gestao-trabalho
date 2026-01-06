-- =====================================================
-- 🔍 VALIDAÇÃO SIMPLIFICADA DE DADOS NO APP_STATE
-- =====================================================
-- Versão simplificada sem funções set-returning problemáticas

-- =====================================================
-- 📊 CONTAGEM DE REGISTROS - TUDO NUMA QUERY
-- =====================================================

SELECT
  '=== VALIDAÇÃO COMPLETA ===' as relatorio,
  id,

  -- TimeEntries
  COALESCE(jsonb_array_length(payload->'timeEntries'), 0) as timeentries,

  -- Orders
  COALESCE(jsonb_array_length(payload->'orders'), 0) as orders,

  -- Projects
  COALESCE(jsonb_array_length(payload->'projects'), 0) as projects,

  -- Activity
  COALESCE(jsonb_array_length(payload->'activity'), 0) as activity,

  -- Catalog
  COALESCE(jsonb_array_length(payload->'catalog'), 0) as catalog,

  -- Vehicles
  COALESCE(jsonb_array_length(payload->'vehicles'), 0) as vehicles,

  -- Agenda
  COALESCE(jsonb_array_length(payload->'agenda'), 0) as agenda,

  -- Notifications
  COALESCE(jsonb_array_length(payload->'notifications'), 0) as notifications,

  -- Theme e Density
  payload->>'theme' as theme,
  payload->>'density' as density,

  -- Timestamps
  payload->>'updatedAt' as app_updated,
  updated_at as db_updated

FROM app_state
WHERE id = 'shared';

-- =====================================================
-- 👥 CONTAGEM DE COLABORADORES (PEOPLE)
-- =====================================================

SELECT
  '=== COLABORADORES ===' as secao,
  COUNT(*) as total_colaboradores
FROM (
  SELECT jsonb_object_keys(payload->'people') as nome
  FROM app_state
  WHERE id = 'shared'
) sub;

-- =====================================================
-- 🏪 CONTAGEM DE FORNECEDORES (SUPPLIERS)
-- =====================================================

SELECT
  '=== FORNECEDORES ===' as secao,
  COUNT(*) as total_fornecedores
FROM (
  SELECT jsonb_object_keys(payload->'suppliers') as nome
  FROM app_state
  WHERE id = 'shared'
) sub;

-- =====================================================
-- ✅ VERIFICAÇÃO DE CAMPOS OBRIGATÓRIOS
-- =====================================================

SELECT
  '=== CAMPOS OBRIGATÓRIOS ===' as secao,
  payload ? 'timeEntries' as tem_timeentries,
  payload ? 'orders' as tem_orders,
  payload ? 'projects' as tem_projects,
  payload ? 'activity' as tem_activity,
  payload ? 'catalog' as tem_catalog,
  payload ? 'people' as tem_people,
  payload ? 'prefs' as tem_prefs,
  payload ? 'vehicles' as tem_vehicles,
  payload ? 'agenda' as tem_agenda,
  payload ? 'suppliers' as tem_suppliers,
  payload ? 'notifications' as tem_notifications,
  payload ? 'theme' as tem_theme,
  payload ? 'density' as tem_density
FROM app_state
WHERE id = 'shared';

-- =====================================================
-- 🔍 VERIFICAÇÃO DE TIPOS
-- =====================================================

SELECT
  '=== TIPOS DE DADOS ===' as secao,

  jsonb_typeof(payload->'timeEntries') as tipo_timeentries,
  jsonb_typeof(payload->'orders') as tipo_orders,
  jsonb_typeof(payload->'projects') as tipo_projects,
  jsonb_typeof(payload->'activity') as tipo_activity,
  jsonb_typeof(payload->'catalog') as tipo_catalog,
  jsonb_typeof(payload->'vehicles') as tipo_vehicles,
  jsonb_typeof(payload->'agenda') as tipo_agenda,
  jsonb_typeof(payload->'notifications') as tipo_notifications,

  jsonb_typeof(payload->'people') as tipo_people,
  jsonb_typeof(payload->'suppliers') as tipo_suppliers,
  jsonb_typeof(payload->'prefs') as tipo_prefs,

  jsonb_typeof(payload->'theme') as tipo_theme,
  jsonb_typeof(payload->'density') as tipo_density

FROM app_state
WHERE id = 'shared';

-- =====================================================
-- 📦 TAMANHO DO PAYLOAD
-- =====================================================

SELECT
  '=== TAMANHO DO PAYLOAD ===' as secao,
  LENGTH(payload::text) as bytes,
  ROUND(LENGTH(payload::text)::numeric / 1024, 2) as kb,
  ROUND(LENGTH(payload::text)::numeric / 1024 / 1024, 4) as mb
FROM app_state
WHERE id = 'shared';

-- =====================================================
-- 📋 PRIMEIROS REGISTROS (EXEMPLOS)
-- =====================================================

-- TimeEntries (primeiros 3)
SELECT
  '⏱️ TimeEntries (primeiros 3)' as secao,
  elem->>'id' as id,
  elem->>'date' as data,
  elem->>'worker' as trabalhador,
  elem->>'template' as tipo,
  elem->>'hours' as horas
FROM (
  SELECT jsonb_array_elements(payload->'timeEntries') as elem
  FROM app_state
  WHERE id = 'shared'
) sub
LIMIT 3;

-- Projects (primeiros 3)
SELECT
  '🏗️ Projects (primeiros 3)' as secao,
  elem->>'id' as id,
  elem->>'name' as nome,
  elem->>'type' as tipo,
  elem->>'family' as familia
FROM (
  SELECT jsonb_array_elements(payload->'projects') as elem
  FROM app_state
  WHERE id = 'shared'
) sub
LIMIT 3;

-- =====================================================
-- ✅ RESUMO FINAL
-- =====================================================

DO $$
DECLARE
  payload_data JSONB;
  campos_presentes INT := 0;
  campos_obrigatorios INT := 13;
  total_timeentries INT := 0;
  total_orders INT := 0;
  total_projects INT := 0;
BEGIN
  -- Buscar payload
  SELECT payload INTO payload_data
  FROM app_state
  WHERE id = 'shared';

  -- Contar campos presentes
  IF payload_data ? 'timeEntries' THEN campos_presentes := campos_presentes + 1; END IF;
  IF payload_data ? 'orders' THEN campos_presentes := campos_presentes + 1; END IF;
  IF payload_data ? 'projects' THEN campos_presentes := campos_presentes + 1; END IF;
  IF payload_data ? 'activity' THEN campos_presentes := campos_presentes + 1; END IF;
  IF payload_data ? 'catalog' THEN campos_presentes := campos_presentes + 1; END IF;
  IF payload_data ? 'people' THEN campos_presentes := campos_presentes + 1; END IF;
  IF payload_data ? 'prefs' THEN campos_presentes := campos_presentes + 1; END IF;
  IF payload_data ? 'vehicles' THEN campos_presentes := campos_presentes + 1; END IF;
  IF payload_data ? 'agenda' THEN campos_presentes := campos_presentes + 1; END IF;
  IF payload_data ? 'suppliers' THEN campos_presentes := campos_presentes + 1; END IF;
  IF payload_data ? 'notifications' THEN campos_presentes := campos_presentes + 1; END IF;
  IF payload_data ? 'theme' THEN campos_presentes := campos_presentes + 1; END IF;
  IF payload_data ? 'density' THEN campos_presentes := campos_presentes + 1; END IF;

  -- Contar registros
  total_timeentries := COALESCE(jsonb_array_length(payload_data->'timeEntries'), 0);
  total_orders := COALESCE(jsonb_array_length(payload_data->'orders'), 0);
  total_projects := COALESCE(jsonb_array_length(payload_data->'projects'), 0);

  -- Relatório
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════╗';
  RAISE NOTICE '║     RELATÓRIO DE VALIDAÇÃO FINAL               ║';
  RAISE NOTICE '╠════════════════════════════════════════════════╣';
  RAISE NOTICE '║ Campos obrigatórios: % de %                  ║', campos_presentes, campos_obrigatorios;
  RAISE NOTICE '║                                                ║';
  RAISE NOTICE '║ 📊 DADOS:                                      ║';
  RAISE NOTICE '║   • TimeEntries: % registros                  ║', LPAD(total_timeentries::text, 4, ' ');
  RAISE NOTICE '║   • Orders: % registros                       ║', LPAD(total_orders::text, 4, ' ');
  RAISE NOTICE '║   • Projects: % registros                     ║', LPAD(total_projects::text, 4, ' ');
  RAISE NOTICE '╠════════════════════════════════════════════════╣';

  IF campos_presentes = campos_obrigatorios THEN
    RAISE NOTICE '║ STATUS: ✅ TODOS OS DADOS VALIDADOS!          ║';
  ELSE
    RAISE NOTICE '║ STATUS: ❌ CAMPOS EM FALTA!                   ║';
  END IF;

  RAISE NOTICE '╚════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- 📝 FIM DO SCRIPT
-- =====================================================
-- Execute este script sempre que quiser validar os dados.
-- Todas as queries devem executar sem erros.
-- =====================================================
