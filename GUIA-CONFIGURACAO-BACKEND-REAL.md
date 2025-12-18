# 🚀 GUIA DE CONFIGURAÇÃO - BACKEND REAL

## 📋 RESUMO DA SOLUÇÃO

A aplicação foi **completamente reformulada** para suportar **20+ colaboradores trabalhando simultaneamente** sem conflitos de dados.

### **O QUE FOI IMPLEMENTADO:**

✅ **Backend Real** - Registos individuais na tabela `time_entries`
✅ **Sync Concorrente** - Múltiplos utilizadores ao mesmo tempo
✅ **Permissões Granulares** - Row Level Security (RLS)
✅ **Performance Otimizada** - Queries com índices
✅ **Filtro Automático** - Técnicos veem apenas seus dados

---

## 🛠️ PASSO 1: CONFIGURAR SUPABASE

### 1.1 Abrir o Supabase SQL Editor

1. Ir para: https://supabase.com/dashboard
2. Selecionar o projeto
3. Menu lateral: **SQL Editor**
4. Clicar em: **"+ New Query"**

### 1.2 Executar o Schema SQL

#### ⚠️ IMPORTANTE: Se a tabela `time_entries` JÁ EXISTE

Se recebeste o erro: **"column worker does not exist"**, significa que a tabela já existe com estrutura diferente.

**OPÇÃO A: Fazer backup primeiro** (Recomendado se tens dados importantes)

1. Abrir o ficheiro: `supabase-backup.sql`
2. Copiar e executar no SQL Editor (cria backup)
3. Depois executar o `supabase-schema.sql`
4. Restaurar dados com o resto do `supabase-backup.sql`

**OPÇÃO B: Recriar sem backup** (Se não tens dados importantes)

1. Abrir o ficheiro: `supabase-schema.sql` (já inclui DROP TABLE)
2. **Copiar TODO o conteúdo** do ficheiro
3. **Colar** no SQL Editor do Supabase
4. Clicar em: **"Run"** (ou `Ctrl+Enter`)

**✅ Sucesso:** Deves ver mensagens de sucesso para:
- `DROP TABLE IF EXISTS time_entries` (remove tabela antiga)
- `CREATE TABLE time_entries` (cria nova)
- `CREATE INDEX` (6 índices)
- `CREATE POLICY` (6 políticas)
- `CREATE FUNCTION` (2 funções)
- `✅✅✅ SCHEMA CRIADO COM SUCESSO!` (verificação final)

---

## 🔄 PASSO 2: MIGRAR DADOS EXISTENTES (Opcional)

Se já tens registos de horas no sistema antigo (localStorage/app_state):

### Opção A: Migração Automática (SQL)

1. No **SQL Editor**, executar:
```sql
SELECT migrate_app_state_to_time_entries();
```

2. Verificar quantos registos foram migrados:
```sql
SELECT COUNT(*) FROM time_entries;
```

### Opção B: Migração Manual (Backup/Restore)

1. Na app (como Admin):
   - Ir para: **Importar/Exportar**
   - Clicar: **"📥 Exportar Backup"**
   - Guardar: `backup_2025-12-18.json`

2. Recarregar a página
3. Os registos serão automaticamente sincronizados para a nova tabela

---

## ✅ PASSO 3: VERIFICAR INSTALAÇÃO

### 3.1 Verificar Tabela

```sql
-- Ver estrutura da tabela
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'time_entries';
```

**Esperado:** 18 colunas (id, user_id, date, template, hours, overtime, etc.)

### 3.2 Verificar Políticas RLS

```sql
-- Ver políticas ativas
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'time_entries';
```

**Esperado:** 6 políticas:
- `admin_all_access`
- `management_read_all`
- `tecnico_own_data`
- `tecnico_insert_own`
- `tecnico_update_own`
- `tecnico_delete_own`

### 3.3 Verificar Índices

```sql
-- Ver índices criados
SELECT indexname FROM pg_indexes
WHERE tablename = 'time_entries';
```

**Esperado:** 6 índices:
- `idx_time_entries_user_id`
- `idx_time_entries_date`
- `idx_time_entries_worker`
- `idx_time_entries_project`
- `idx_time_entries_status`
- `idx_time_entries_created_at`

---

## 🧪 PASSO 4: TESTAR A APLICAÇÃO

### Teste 1: Login e Carregamento

**Utilizador:** Admin

1. Fazer login na aplicação
2. **Verificar Console do Browser** (F12 → Console):
   ```
   ✅ Esperado:
   📥 Carregando time_entries do Supabase...
   ✅ X time_entries carregados do Supabase
   ```

3. **Verificar Sidebar** - Indicador de sincronização:
   - 🟢 **"Sincronizado"** = Tudo bem
   - 🔴 **"Erro ao sincronizar"** = Problema (ver console)

### Teste 2: Criar Registo (Técnico)

**Utilizador:** Técnico (role: 'tecnico')

1. Login como técnico
2. Ir para: **Meu Perfil**
3. Clicar: **"Registar Tempo"**
4. Preencher:
   - Data: Hoje
   - Horas: 8
   - Projeto: Qualquer obra
5. Guardar

6. **Verificar Console:**
   ```
   ☁️ Sincronizando time_entries para Supabase...
   ✅ 1 registos sincronizados para Supabase
   ```

7. **Verificar no Supabase:**
   ```sql
   SELECT * FROM time_entries
   WHERE worker = 'Nome_Do_Tecnico'
   ORDER BY created_at DESC
   LIMIT 1;
   ```

**✅ Sucesso:** Registo aparece no Supabase

### Teste 3: Isolamento de Dados

**Objetivo:** Verificar que técnicos SÓ veem seus dados

1. **Browser 1** - Login como **Técnico A**
   - Criar registo: "8h - Obra X"
   - Ir para: **Meu Perfil**
   - **Verificar:** Apenas o registo do Técnico A aparece

2. **Browser 2** - Login como **Técnico B**
   - Criar registo: "7h - Obra Y"
   - Ir para: **Meu Perfil**
   - **Verificar:** Apenas o registo do Técnico B aparece
   - ❌ **NÃO deve ver** o registo do Técnico A

3. **Browser 3** - Login como **Admin**
   - Ir para: **Relatório Mensal de Colaboradores**
   - **Verificar:** Admin vê AMBOS os registos (A + B)

**✅ Sucesso:** Técnicos isolados, Admin vê tudo

### Teste 4: Sync Concorrente (20 Utilizadores)

**Objetivo:** Verificar que múltiplos utilizadores podem trabalhar simultaneamente

**Setup:**
1. Criar 5 utilizadores de teste no Supabase:
   - `profiles` table: id, name, role='tecnico', email

**Execução:**
1. Abrir **5 browsers/janelas incognito**
2. Fazer login como cada técnico em cada janela
3. **SIMULTANEAMENTE** (nos 5 browsers):
   - Criar 1 registo de horas em CADA janela
   - Tempo: Dentro de 10 segundos

4. **Verificar no Supabase:**
   ```sql
   SELECT worker, COUNT(*)
   FROM time_entries
   WHERE created_at > NOW() - INTERVAL '1 minute'
   GROUP BY worker;
   ```

**✅ Sucesso:** 5 registos (1 por técnico), nenhum perdido

### Teste 5: Multi-Device do Mesmo Utilizador

**Objetivo:** Verificar que 1 utilizador pode usar Desktop + Telemóvel

1. **Desktop** - Login como Técnico
   - Criar registo: "8h - Segunda"
   - Aguardar sync (🟢 Sincronizado)
   - **NÃO fechar browser**

2. **Telemóvel** - Login com MESMO Técnico
   - Abrir app
   - **Verificar:** Registo "8h - Segunda" aparece

3. **Telemóvel** - Criar novo registo: "8h - Terça"
   - Aguardar sync

4. **Desktop** - Recarregar página
   - **Verificar:** Ambos os registos aparecem

**✅ Sucesso:** Dados sincronizam entre dispositivos

---

## 🐛 RESOLUÇÃO DE PROBLEMAS

### Problema 1: "❌ Erro ao carregar time_entries"

**Console mostra:**
```
❌ Erro ao carregar time_entries: relation "time_entries" does not exist
```

**Solução:**
1. Executar `supabase-schema.sql` novamente
2. Verificar que a tabela foi criada:
   ```sql
   SELECT * FROM time_entries LIMIT 1;
   ```

---

### Problema 2: "❌ Error: new row violates row-level security policy"

**Causa:** RLS está bloqueando a inserção

**Solução:**
1. Verificar que o utilizador tem `role` correto na tabela `profiles`:
   ```sql
   SELECT id, name, role FROM profiles WHERE email = 'tecnico@empresa.pt';
   ```

2. Se o `role` estiver vazio ou incorreto:
   ```sql
   UPDATE profiles
   SET role = 'tecnico'
   WHERE email = 'tecnico@empresa.pt';
   ```

3. Fazer logout e login novamente

---

### Problema 3: Técnico vê dados de outros técnicos

**Causa:** Política RLS não está ativa ou incorreta

**Solução:**
1. Verificar que RLS está ATIVO:
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE tablename = 'time_entries';
   ```
   **Esperado:** `rowsecurity = true`

2. Se `false`, ativar:
   ```sql
   ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
   ```

3. Re-executar as políticas do `supabase-schema.sql`

---

### Problema 4: Sync muito lento

**Causa:** Muitos registos sem índices

**Solução:**
1. Verificar índices:
   ```sql
   SELECT indexname FROM pg_indexes
   WHERE tablename = 'time_entries';
   ```

2. Se faltarem índices, executar:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
   CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
   CREATE INDEX IF NOT EXISTS idx_time_entries_worker ON time_entries(worker);
   ```

---

### Problema 5: "🔴 ERRO CRÍTICO: Dados não sincronizados!"

**Causa:** Sem ligação à internet ou Supabase offline

**Solução:**
1. **NÃO FECHAR O BROWSER!**
2. Verificar ligação à internet
3. Verificar status do Supabase: https://status.supabase.com
4. Aguardar reconexão
5. Indicador deve voltar a 🟢 automaticamente

---

## 📊 MONITORIZAÇÃO

### Queries Úteis para Admin

**1. Total de registos por técnico (últimos 30 dias):**
```sql
SELECT
  worker,
  COUNT(*) as total_registos,
  SUM(hours) as total_horas
FROM time_entries
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY worker
ORDER BY total_horas DESC;
```

**2. Registos criados hoje:**
```sql
SELECT worker, template, hours, project, created_at
FROM time_entries
WHERE date = CURRENT_DATE
ORDER BY created_at DESC;
```

**3. Utilizadores ativos (última semana):**
```sql
SELECT DISTINCT worker, MAX(created_at) as ultima_atividade
FROM time_entries
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY worker
ORDER BY ultima_atividade DESC;
```

**4. Tamanho da tabela (performance):**
```sql
SELECT
  pg_size_pretty(pg_total_relation_size('time_entries')) as tamanho_total,
  COUNT(*) as total_registos
FROM time_entries;
```

---

## ✅ CHECKLIST DE PRODUÇÃO

Antes de lançar para todos os 20 colaboradores:

- [ ] Tabela `time_entries` criada e com RLS ativo
- [ ] 6 políticas RLS criadas e funcionais
- [ ] 6 índices criados para performance
- [ ] Testado com 3-5 utilizadores simultâneos
- [ ] Testado isolamento (técnico A não vê dados de técnico B)
- [ ] Admin consegue ver TODOS os registos
- [ ] Indicador de sincronização funciona (🟢/🔴)
- [ ] Backup manual testado (Exportar/Importar)
- [ ] Multi-device testado (desktop + telemóvel)
- [ ] Dados antigos migrados (se aplicável)

---

## 🎯 DIFERENÇAS DA SOLUÇÃO ANTIGA

| Feature | Antes (Solução 1) | Agora (Solução 2) |
|---------|-------------------|-------------------|
| Conflitos de dados | ❌ Último a sincronizar ganha | ✅ Sem conflitos |
| Múltiplos users | ❌ Máx 3-5 | ✅ 20+ simultâneos |
| Performance | ❌ Carrega TUDO (50MB+) | ✅ Apenas dados do user |
| Permissões | ❌ Frontend only | ✅ Backend RLS |
| Isolamento | ❌ Todos veem tudo | ✅ Técnicos isolados |
| Auditoria | ❌ Sem histórico | ✅ created_by, updated_by |
| Multi-device | ❌ Conflitos | ✅ Sem conflitos |

---

## 📞 SUPORTE

Se encontrares algum problema:

1. **Verificar Console do Browser** (F12 → Console)
2. **Procurar mensagens de erro** que começam com `❌`
3. **Consultar a secção "Resolução de Problemas"** acima
4. **Verificar indicador de sincronização** na sidebar

---

**Commit:** `4d603e7` - 🚀 Solução 2: Backend Real + Sync Concorrente
**Build:** ✅ 479.63 kB
**Data:** 2025-12-18
