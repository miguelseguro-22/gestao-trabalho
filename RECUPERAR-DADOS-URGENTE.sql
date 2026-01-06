-- =====================================================
-- 🚨 RECUPERAÇÃO URGENTE DE DADOS
-- =====================================================
-- Execute IMEDIATAMENTE para verificar se dados existem!

-- =====================================================
-- PASSO 1: VERIFICAR SE DADOS EXISTEM NO SUPABASE
-- =====================================================

SELECT '🔍 VERIFICAÇÃO URGENTE DE DADOS' as status;

-- Ver TUDO do app_state
SELECT
  id,
  COALESCE(jsonb_array_length(payload->'timeEntries'), 0) as total_timeentries,
  COALESCE(jsonb_array_length(payload->'orders'), 0) as total_orders,
  COALESCE(jsonb_array_length(payload->'projects'), 0) as total_projects,
  LENGTH(payload::text) as tamanho_bytes,
  updated_at,
  payload->>'updatedAt' as app_updated
FROM app_state
WHERE id = 'shared';

-- =====================================================
-- PASSO 2: VER SE HÁ OUTROS REGISTROS (user_*)
-- =====================================================

SELECT '📊 OUTROS REGISTROS' as status;

SELECT
  id,
  COALESCE(jsonb_array_length(payload->'timeEntries'), 0) as timeentries,
  updated_at
FROM app_state
WHERE id LIKE 'user_%'
ORDER BY updated_at DESC;

-- =====================================================
-- PASSO 3: VER PRIMEIROS 10 TIMEENTRIES DO SHARED
-- =====================================================

SELECT '⏱️ PRIMEIROS 10 TIMEENTRIES' as status;

SELECT
  elem->>'id' as id,
  elem->>'date' as data,
  elem->>'worker' as trabalhador,
  elem->>'template' as tipo,
  elem->>'hours' as horas,
  elem->>'project' as projeto
FROM (
  SELECT jsonb_array_elements(payload->'timeEntries') as elem
  FROM app_state
  WHERE id = 'shared'
) sub
LIMIT 10;

-- =====================================================
-- PASSO 4: VER HISTÓRICO DE BACKUPS (SE EXISTIR)
-- =====================================================

SELECT '📦 BACKUPS DISPONÍVEIS' as status;

SELECT
  backup_id,
  backup_date,
  COALESCE(jsonb_array_length(payload->'timeEntries'), 0) as timeentries_backup,
  updated_at
FROM app_state_backup_history
ORDER BY backup_date DESC
LIMIT 5;

-- =====================================================
-- 🚨 SE OS DADOS ESTIVEREM NUM BACKUP:
-- =====================================================

-- DESCOMENTE ISTO para restaurar do último backup:
/*
DO $$
DECLARE
  backup_payload JSONB;
BEGIN
  -- Pegar último backup
  SELECT payload INTO backup_payload
  FROM app_state_backup_history
  ORDER BY backup_date DESC
  LIMIT 1;

  IF backup_payload IS NOT NULL THEN
    -- Restaurar no shared
    UPDATE app_state
    SET
      payload = backup_payload,
      updated_at = NOW()
    WHERE id = 'shared';

    RAISE NOTICE '✅ DADOS RESTAURADOS DO BACKUP!';
  ELSE
    RAISE NOTICE '❌ Nenhum backup encontrado';
  END IF;
END $$;
*/

-- =====================================================
-- 🚨 SE HOUVER DADOS EM user_* MAS NÃO NO SHARED:
-- =====================================================

-- DESCOMENTE ISTO para migrar de user_* para shared:
/*
DO $$
DECLARE
  user_record RECORD;
  all_entries JSONB := '[]'::jsonb;
BEGIN
  -- Recolher de todos os users
  FOR user_record IN
    SELECT payload->'timeEntries' as entries
    FROM app_state
    WHERE id LIKE 'user_%'
    AND payload ? 'timeEntries'
  LOOP
    all_entries := all_entries || user_record.entries;
  END LOOP;

  -- Atualizar shared
  UPDATE app_state
  SET payload = jsonb_set(
    COALESCE(payload, '{}'::jsonb),
    '{timeEntries}',
    all_entries
  )
  WHERE id = 'shared';

  RAISE NOTICE '✅ MIGRADOS % REGISTROS!', jsonb_array_length(all_entries);
END $$;
*/

-- =====================================================
-- RESULTADO: ME MOSTRE ISTO!
-- =====================================================

SELECT
  '🎯 RESULTADO FINAL' as status,
  COUNT(*) as total_registros_app_state
FROM app_state;

SELECT
  id,
  COALESCE(jsonb_array_length(payload->'timeEntries'), 0) as timeentries,
  LENGTH(payload::text) as bytes,
  updated_at
FROM app_state
ORDER BY updated_at DESC;
