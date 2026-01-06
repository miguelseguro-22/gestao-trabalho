-- =====================================================
-- MIGRAÇÃO: Consolidar TODOS os timeEntries em 'shared'
-- =====================================================
-- Este script migra todos os timeEntries de TODOS os utilizadores
-- para o registo 'shared', permitindo sync multi-dispositivo

-- =====================================================
-- PASSO 1: Ver dados ANTES da migração
-- =====================================================
SELECT '=== ANTES DA MIGRAÇÃO ===' as status;

SELECT
  id,
  jsonb_array_length(payload->'timeEntries') as total_time_entries,
  updated_at
FROM app_state
WHERE payload ? 'timeEntries'
ORDER BY updated_at DESC;

-- =====================================================
-- PASSO 2: Consolidar TODOS os timeEntries em 'shared'
-- =====================================================

DO $$
DECLARE
  user_record RECORD;
  shared_payload JSONB;
  all_time_entries JSONB := '[]'::jsonb;
  entry JSONB;
  entry_count INT := 0;
BEGIN
  -- 1. Recolher TODOS os timeEntries de TODOS os users
  FOR user_record IN
    SELECT id, payload
    FROM app_state
    WHERE id LIKE 'user_%'
    AND payload ? 'timeEntries'
  LOOP
    RAISE NOTICE 'Processando user: % (% registos)',
      user_record.id,
      jsonb_array_length(user_record.payload->'timeEntries');

    -- Adicionar todos os timeEntries deste user ao array consolidado
    FOR entry IN
      SELECT * FROM jsonb_array_elements(user_record.payload->'timeEntries')
    LOOP
      all_time_entries := all_time_entries || entry;
      entry_count := entry_count + 1;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Total de timeEntries recolhidos: %', entry_count;

  -- 2. Obter payload atual do 'shared' (se existir)
  SELECT payload INTO shared_payload
  FROM app_state
  WHERE id = 'shared';

  -- 3. Se 'shared' não existir, criar estrutura base
  IF shared_payload IS NULL THEN
    shared_payload := '{
      "orders": [],
      "projects": [],
      "activity": [],
      "theme": "light",
      "density": "comfy",
      "catalog": [],
      "people": {},
      "prefs": {},
      "vehicles": [],
      "agenda": [],
      "suppliers": {},
      "notifications": []
    }'::jsonb;
    RAISE NOTICE 'Criada estrutura base para shared';
  END IF;

  -- 4. Adicionar/substituir timeEntries no shared
  shared_payload := jsonb_set(shared_payload, '{timeEntries}', all_time_entries);
  shared_payload := jsonb_set(shared_payload, '{updatedAt}', to_jsonb(NOW()::text));

  -- 5. Gravar no 'shared'
  INSERT INTO app_state (id, payload, updated_at)
  VALUES ('shared', shared_payload, NOW())
  ON CONFLICT (id)
  DO UPDATE SET
    payload = EXCLUDED.payload,
    updated_at = EXCLUDED.updated_at;

  RAISE NOTICE '✅ Migração completa! % timeEntries gravados em shared', entry_count;
END $$;

-- =====================================================
-- PASSO 3: Verificar resultado DEPOIS da migração
-- =====================================================
SELECT '=== DEPOIS DA MIGRAÇÃO ===' as status;

SELECT
  id,
  jsonb_array_length(payload->'timeEntries') as total_time_entries,
  updated_at,
  LENGTH(payload::text) as tamanho_bytes
FROM app_state
WHERE id = 'shared';

-- =====================================================
-- PASSO 4: (OPCIONAL) Limpar app_state dos users
-- =====================================================
-- ⚠️ CUIDADO: Isto apaga os dados individuais dos users!
-- Só execute depois de confirmar que 'shared' tem TODOS os dados!

-- DESCOMENTE AS LINHAS ABAIXO SE QUISER LIMPAR:
-- DELETE FROM app_state WHERE id LIKE 'user_%';
-- SELECT '✅ App_state dos users removido' as status;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. ANTES de executar, faz BACKUP da tabela app_state:
--    CREATE TABLE app_state_backup AS SELECT * FROM app_state;
--
-- 2. Depois de migrar, testa a aplicação:
--    - Admin deve ver TODOS os registos
--    - Técnicos devem ver apenas os seus (filtrado no frontend)
--    - Criar novo registo deve aparecer para todos
--
-- 3. Se algo correr mal, restaura o backup:
--    TRUNCATE app_state;
--    INSERT INTO app_state SELECT * FROM app_state_backup;
--
-- 4. Só apaga os app_state individuais (user_*) depois de
--    confirmar que tudo funciona perfeitamente!
