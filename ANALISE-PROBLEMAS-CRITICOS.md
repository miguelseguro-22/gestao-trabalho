# 🔴 ANÁLISE DE PROBLEMAS CRÍTICOS
## Gestão de Trabalho - Preparação para Lançamento (20+ Técnicos)

**Data:** 2025-12-18
**Status:** Identificação de Problemas Potenciais

---

## 📊 RESUMO EXECUTIVO

Após análise profunda do código, identifiquei **8 categorias de problemas** que podem causar falhas quando a aplicação for lançada para 20+ técnicos trabalhando simultaneamente.

**Prioridades:**
- 🔴 **CRÍTICO** (3 problemas) - Podem causar perda de dados ou falhas graves
- 🟠 **ALTO** (4 problemas) - Podem causar mau funcionamento ou frustração
- 🟡 **MÉDIO** (3 problemas) - Podem causar lentidão ou inconsistências
- 🟢 **BAIXO** (2 problemas) - Melhorias de UX

---

## 🔴 PROBLEMAS CRÍTICOS

### **1. ADMIN SOBRESCREVE user_id AO EDITAR REGISTOS DE OUTROS** 🔴

**Descrição:**
Quando um Admin edita um registo de um técnico, o `syncBatch()` sobrescreve o `user_id` com o ID do admin!

**Localização:** `App.tsx:306-356` (TimeEntriesService.syncBatch)

**Código Problemático:**
```typescript
async syncBatch(entries: any[], userId: string, userName: string, lastSyncTime: string | null) {
  const dbEntries = entriesToSync.map(entry => ({
    id: entry.id,
    user_id: userId,  // ❌ SOBRESCREVE com o ID do admin!
    worker: entry.worker || userName,
    // ...
  }))
}
```

**Cenário de Falha:**
1. Técnico A cria registo → `user_id = técnico_A`
2. Admin vê o registo e edita (corrige horas)
3. Sync executa → `user_id = admin` ❌
4. Técnico A perde acesso ao seu próprio registo!

**Impacto:** 🔴 **CRÍTICO** - Perda de dados e quebra de isolamento

**Solução:**
```typescript
async syncBatch(entries: any[], userId: string, userName: string, lastSyncTime: string | null) {
  const dbEntries = entriesToSync.map(entry => ({
    id: entry.id,
    user_id: entry.user_id || userId,  // ✅ Preserva user_id original
    worker: entry.worker || userName,
    updated_by: userId,  // ✅ Regista quem fez a alteração
    // ...
  }))
}
```

---

### **2. SEM RETRY AUTOMÁTICO - FALHAS DE REDE CAUSAM PERDA DE DADOS** 🔴

**Descrição:**
Quando o sync falha (rede instável, timeout, etc.), os dados ficam apenas no localStorage. Se o utilizador limpar o cache ou trocar de dispositivo, **perde os dados**.

**Localização:** `App.tsx:9303-9340`

**Código Problemático:**
```typescript
const result = await TimeEntriesService.syncBatch(...)

if (result.success) {
  // ✅ Sucesso
} else {
  console.error('❌ Erro ao sincronizar:', result.error)
  setSyncError(result.error)
  // ❌ NÃO HÁ RETRY! Dados ficam perdidos.
}
```

**Cenário de Falha:**
1. Técnico regista 8 horas de trabalho
2. Rede instável → sync falha
3. Técnico fecha a app
4. Dados ficam no localStorage
5. Técnico limpa cache → **dados perdidos** ❌

**Impacto:** 🔴 **CRÍTICO** - Perda de dados de trabalho

**Solução:** Implementar retry exponencial com backoff:
```typescript
async function syncWithRetry(maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await TimeEntriesService.syncBatch(...)

    if (result.success) return result

    if (attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000 // 2s, 4s, 8s
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  // Após 3 tentativas, adicionar a queue offline
  addToOfflineQueue(entries)
}
```

---

### **3. CONFLITOS DE EDIÇÃO SIMULTÂNEA (LAST WRITE WINS)** 🔴

**Descrição:**
Dois utilizadores podem editar o mesmo registo ao mesmo tempo. O último a gravar **sobrescreve** o primeiro, causando perda de dados.

**Cenário de Falha:**
1. Admin abre registo do Técnico A (8h trabalho, projeto "Obra X")
2. Técnico A abre o mesmo registo e adiciona 2h extras → grava → 10h total
3. Admin corrige o projeto para "Obra Y" → grava
4. **Resultado:** Projeto correto, mas horas voltaram para 8h ❌ (perdeu as 2h extras)

**Localização:** `App.tsx:267-270` (upsert sem verificação)

```typescript
const { error } = await supabase
  .from('time_entries')
  .upsert(dbEntry, { onConflict: 'id' })
  // ❌ Sem verificação de updated_at - last write wins!
```

**Impacto:** 🔴 **CRÍTICO** - Perda de alterações silenciosa

**Solução:** Implementar **Optimistic Locking** com `updated_at`:
```typescript
// 1. Verificar se o registo foi alterado por outro user
const { data: current } = await supabase
  .from('time_entries')
  .select('updated_at')
  .eq('id', entry.id)
  .single()

if (current && current.updated_at !== entry.updatedAt) {
  // ❌ Conflito detectado!
  return {
    success: false,
    conflict: true,
    message: 'Este registo foi alterado por outro utilizador'
  }
}

// 2. Atualizar com verificação
const { error } = await supabase
  .from('time_entries')
  .update(dbEntry)
  .eq('id', entry.id)
  .eq('updated_at', entry.updatedAt)  // ✅ Só atualiza se não mudou
```

---

## 🟠 PROBLEMAS DE ALTA PRIORIDADE

### **4. VALIDAÇÕES DE DADOS AUSENTES** 🟠

**Descrição:**
Não existem validações para prevenir dados inválidos.

**Problemas Possíveis:**
- ❌ Horas negativas (-5 horas)
- ❌ Horas excessivas (50 horas num dia)
- ❌ Datas futuras (registo para 2026)
- ❌ Campos obrigatórios vazios
- ❌ Sobreposição de períodos (8h-10h e 9h-11h no mesmo dia)

**Impacto:** 🟠 **ALTO** - Dados inconsistentes, relatórios errados

**Solução:** Adicionar validações antes de gravar:
```typescript
function validateTimeEntry(entry: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validar horas
  if (entry.hours < 0) errors.push('Horas não podem ser negativas')
  if (entry.hours > 24) errors.push('Máximo 24 horas por dia')
  if (entry.overtime < 0) errors.push('Horas extra não podem ser negativas')
  if ((entry.hours + entry.overtime) > 24) errors.push('Total excede 24 horas')

  // Validar data
  const entryDate = new Date(entry.date)
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  if (entryDate > today) errors.push('Não pode registar horas no futuro')
  if (entryDate < new Date('2020-01-01')) errors.push('Data inválida')

  // Validar campos obrigatórios
  if (!entry.worker) errors.push('Colaborador é obrigatório')
  if (!entry.template) errors.push('Tipo de registo é obrigatório')

  // Validar sobreposição de períodos (se periodStart e periodEnd existirem)
  if (entry.periodStart && entry.periodEnd) {
    const start = new Date(`1970-01-01T${entry.periodStart}`)
    const end = new Date(`1970-01-01T${entry.periodEnd}`)

    if (start >= end) errors.push('Hora de fim deve ser depois da hora de início')
  }

  return { valid: errors.length === 0, errors }
}
```

---

### **5. PERFORMANCE - ADMIN CARREGA 4000+ REGISTOS** 🟠

**Descrição:**
Admin, Diretor e Logística carregam **TODOS** os registos de **TODOS** os técnicos sem paginação.

**Cenário:**
- 20 técnicos × 200 registos cada = **4000 registos**
- Cada registo ~500 bytes = **2MB de dados**
- Tempo de carregamento: 5-10 segundos
- Re-render a cada mudança

**Localização:** `App.tsx:199-201`

```typescript
if (role === 'admin' || role === 'diretor' || role === 'logistica') {
  // Não aplica filtro - carrega TUDO ❌
  console.log(`🔓 [Backend] ${role} a carregar TODOS os registos`)
}
```

**Impacto:** 🟠 **ALTO** - Aplicação lenta para Admin/Diretor

**Solução 1 - Paginação:**
```typescript
async fetchUserEntries(userId: string, role: string, page = 1, pageSize = 50) {
  let query = supabase
    .from('time_entries')
    .select('*', { count: 'exact' })
    .order('date', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  // ...filtros por role
}
```

**Solução 2 - Filtro por Data (mais simples):**
```typescript
// Por defeito, carregar apenas último mês
if (role === 'admin' || role === 'diretor' || role === 'logistica') {
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  query = query.gte('date', oneMonthAgo.toISOString().split('T')[0])

  console.log(`🔓 [Backend] ${role} a carregar registos do último mês`)
}
```

---

### **6. RLS INCOMPLETO - DIRETOR/LOGÍSTICA NÃO PODEM CRIAR REGISTOS** 🟠

**Descrição:**
Diretor e Logística têm política apenas para **SELECT**. Se tentarem criar/editar registos, a operação **falha**.

**Localização:** `supabase-fix-encarregado-rls.sql:44-53`

```sql
-- ✅ Política: Diretor e Logística veem TUDO (apenas leitura)
CREATE POLICY "management_read_all" ON time_entries
  FOR SELECT  -- ❌ Só SELECT! Sem INSERT/UPDATE/DELETE
  TO authenticated
  USING (...)
```

**Cenário de Falha:**
1. Diretor tenta criar registo de férias → **FALHA** (sem política INSERT)
2. Logística tenta corrigir erro → **FALHA** (sem política UPDATE)

**Impacto:** 🟠 **ALTO** - Funcionalidade limitada

**Solução:** Adicionar políticas completas:
```sql
-- ✅ Diretor e Logística podem CRIAR registos
CREATE POLICY "management_insert_any" ON time_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('diretor', 'logistica')
    )
  );

-- ✅ Diretor e Logística podem EDITAR qualquer registo
CREATE POLICY "management_update_any" ON time_entries
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('diretor', 'logistica')
    )
  )
  WITH CHECK (true);

-- ⚠️ APAGAR apenas Admin (proteção extra)
-- Diretor/Logística NÃO têm permissão para apagar
```

---

### **7. QUEUE OFFLINE AUSENTE** 🟠

**Descrição:**
Não existe uma queue persistente para operações que falharam. Se o sync falhar, a operação é simplesmente perdida.

**Impacto:** 🟠 **ALTO** - Dados perdidos em cenários offline

**Solução:** Implementar queue no localStorage:
```typescript
interface OfflineOperation {
  id: string
  type: 'create' | 'update' | 'delete'
  entry: any
  timestamp: string
  retryCount: number
}

const OfflineQueue = {
  add(operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'retryCount'>) {
    const queue = this.getAll()
    queue.push({
      ...operation,
      id: uid(),
      timestamp: new Date().toISOString(),
      retryCount: 0
    })
    localStorage.setItem('offline_queue', JSON.stringify(queue))
  },

  getAll(): OfflineOperation[] {
    const data = localStorage.getItem('offline_queue')
    return data ? JSON.parse(data) : []
  },

  async processQueue() {
    const queue = this.getAll()
    const remaining: OfflineOperation[] = []

    for (const op of queue) {
      const result = await this.processOperation(op)

      if (!result.success) {
        if (op.retryCount < 5) {
          remaining.push({ ...op, retryCount: op.retryCount + 1 })
        }
      }
    }

    localStorage.setItem('offline_queue', JSON.stringify(remaining))
  }
}
```

---

## 🟡 PROBLEMAS DE MÉDIA PRIORIDADE

### **8. DEBOUNCE AGRESSIVO PODE CAUSAR PERDA DE DADOS** 🟡

**Descrição:**
O sync tem debounce de 1 segundo. Se o utilizador fizer alterações rápidas e fechar a aplicação antes do sync, **perde os dados**.

**Localização:** `App.tsx:9303`

```typescript
const syncTimer = setTimeout(async () => {
  // Sync aqui
}, 1000)  // ❌ Se fechar antes de 1s, não sincroniza
```

**Cenário:**
1. Técnico adiciona registo → debounce inicia (1s)
2. Técnico fecha a app aos 0.5s → **dados não sincronizados** ❌

**Impacto:** 🟡 **MÉDIO** - Perda ocasional de dados

**Solução:** Sync ao fechar/minimizar:
```typescript
useEffect(() => {
  const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
    // Forçar sync imediato antes de fechar
    if (timeEntries.length > 0) {
      e.preventDefault()
      await TimeEntriesService.syncBatch(timeEntries, auth.id, auth.name, lastSyncTime)
    }
  }

  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}, [timeEntries])
```

---

### **9. SEM INDICAÇÃO DE PROGRESSO EM OPERAÇÕES LONGAS** 🟡

**Descrição:**
Quando há muitos registos, operações como sync ou carregamento podem demorar vários segundos sem feedback visual adequado.

**Impacto:** 🟡 **MÉDIO** - UX degradada

**Solução:** Adicionar progress bar:
```typescript
const [syncProgress, setSyncProgress] = useState(0)

async syncBatch(entries: any[]) {
  const batchSize = 50
  const batches = Math.ceil(entries.length / batchSize)

  for (let i = 0; i < batches; i++) {
    const batch = entries.slice(i * batchSize, (i + 1) * batchSize)
    await supabase.from('time_entries').upsert(batch)

    setSyncProgress(((i + 1) / batches) * 100)
  }
}
```

---

### **10. filteredTimeEntries RECALCULA DESNECESSARIAMENTE** 🟡

**Descrição:**
O useMemo de `filteredTimeEntries` depende de `[timeEntries, auth]`. Cada mudança em `timeEntries` recalcula o filtro, mesmo que a mudança não afete o resultado.

**Localização:** `App.tsx:9074-9093`

```typescript
const filteredTimeEntries = useMemo(() => {
  // Filtro complexo
}, [timeEntries, auth])  // ❌ Recalcula sempre que timeEntries muda
```

**Impacto:** 🟡 **MÉDIO** - Lentidão em dispositivos fracos

**Solução:** Adicionar hash para evitar recálculos:
```typescript
const timeEntriesHash = useMemo(
  () => timeEntries.map(e => e.id).join(','),
  [timeEntries]
)

const filteredTimeEntries = useMemo(() => {
  // Filtro
}, [timeEntriesHash, auth.id, auth.role])  // ✅ Só recalcula se IDs mudarem
```

---

## 🟢 PROBLEMAS DE BAIXA PRIORIDADE

### **11. LOGS EXCESSIVOS EM PRODUÇÃO** 🟢

**Descrição:**
Muitos `console.log` no código que vão poluir a consola em produção.

**Solução:** Criar logger condicional:
```typescript
const logger = {
  log: (...args: any[]) => {
    if (import.meta.env.DEV) console.log(...args)
  },
  error: (...args: any[]) => console.error(...args)  // Sempre loggar erros
}
```

---

### **12. SEM TELEMETRIA/MÉTRICAS** 🟢

**Descrição:**
Não há forma de monitorizar:
- Quantos sync falharam hoje?
- Qual técnico tem mais erros?
- Quanto tempo demora o carregamento?

**Solução:** Implementar métricas básicas com Supabase:
```sql
CREATE TABLE app_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,  -- 'sync_success', 'sync_error', 'page_load', etc.
  duration_ms INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 📋 RESUMO E PRÓXIMOS PASSOS

### **Problemas por Prioridade:**

| Prioridade | Quantidade | Descrição |
|------------|-----------|-----------|
| 🔴 CRÍTICO | 3 | Perda de dados, conflitos, isolamento |
| 🟠 ALTO | 4 | Validações, performance, RLS incompleto |
| 🟡 MÉDIO | 3 | UX, optimizações |
| 🟢 BAIXO | 2 | Melhorias futuras |

### **Ordem de Implementação Recomendada:**

1. **🔴 #1: Corrigir user_id em syncBatch** (5 min) - CRÍTICO
2. **🔴 #2: Implementar retry automático** (30 min) - CRÍTICO
3. **🟠 #4: Adicionar validações de dados** (45 min) - ALTO
4. **🔴 #3: Implementar detecção de conflitos** (60 min) - CRÍTICO
5. **🟠 #6: Completar RLS policies** (15 min) - ALTO
6. **🟠 #5: Adicionar filtro de data para Admin** (20 min) - ALTO
7. **🟠 #7: Implementar queue offline** (45 min) - ALTO
8. **🟡 #8: Sync ao fechar aplicação** (15 min) - MÉDIO

**Tempo Total Estimado:** ~4 horas para resolver TODOS os problemas críticos e de alta prioridade.

---

## 🎯 RECOMENDAÇÃO

**Sugiro implementarmos os problemas na ordem acima, começando pelos 3 CRÍTICOS (🔴).**

Queres que comece já pela **Correção #1 (user_id em syncBatch)**? É a mais rápida (5 min) e resolve um bug grave.
