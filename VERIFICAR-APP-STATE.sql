-- Ver TODOS os registos de app_state
SELECT 
  id,
  jsonb_array_length(payload->'timeEntries') as total_time_entries,
  updated_at,
  LENGTH(payload::text) as tamanho_payload
FROM app_state
ORDER BY updated_at DESC;

-- Ver qual é o registo 'shared' (se existir)
SELECT 
  'SHARED' as tipo,
  id,
  jsonb_array_length(payload->'timeEntries') as total_registos,
  updated_at
FROM app_state
WHERE id = 'shared';

-- Contar quantos app_state existem
SELECT 
  COUNT(*) as total_app_states,
  COUNT(CASE WHEN id LIKE 'user_%' THEN 1 END) as usuarios_individuais,
  COUNT(CASE WHEN id = 'shared' THEN 1 END) as shared
FROM app_state;
