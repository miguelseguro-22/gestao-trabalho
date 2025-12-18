# 🚀 PLANO DE LANÇAMENTO EM PRODUÇÃO

## ✅ **O QUE JÁ ESTÁ FEITO:**

### 1. Backend Real com Supabase ✅
- Tabela `time_entries` criada e funcional
- 18 colunas com tipos corretos
- Constraints e validações ativas
- Trigger para `updated_at` automático

### 2. Row Level Security (RLS) ✅
- 6 políticas ativas e funcionais
- Admin vê TUDO
- Diretor/Encarregado/Logística veem TUDO
- **Técnicos veem APENAS seus dados** (ISOLAMENTO CONFIRMADO)

### 3. Sync Concorrente ✅
- TimeEntriesService implementado
- Sync incremental (apenas dados novos/alterados)
- Debounce de 1 segundo
- Indicador visual na sidebar (🟢/🔴)
- Notificações de erro

### 4. Performance Otimizada ✅
- 7 índices criados (user_id, date, worker, project, status, created_at)
- Queries rápidas (<2ms)
- Carregar apenas dados do utilizador

---

## 🚨 **PROBLEMAS CRÍTICOS A RESOLVER:**

### **PRIORIDADE 1 - CRÍTICO** 🔴

#### 1.1 Migração de Dados Existentes
**Problema:** Dados antigos estão no localStorage, não no Supabase

**Impacto:** Se técnicos limparem cache, perdem TUDO

**Solução:**
```bash
# Opção A: Cada utilizador exporta seus dados
1. Como Admin: Ir para "Importar/Exportar" → "Exportar Backup"
2. Limpar localStorage de todos
3. Cada técnico importa seu backup

# Opção B: Migração automática (precisa desenvolvimento)
- Criar script que lê localStorage
- Envia para Supabase automaticamente
- Valida migração
```

**Tempo:** 1-2 horas (desenvolvimento) ou 30 min (manual)

---

#### 1.2 Validação de Permissões RLS
**Problema:** Precisamos testar com TODOS os roles

**Testes necessários:**
- ✅ Técnico vê apenas seus dados (TESTADO)
- ⏳ Encarregado vê todos os dados
- ⏳ Diretor vê todos os dados
- ⏳ Logística vê todos os dados
- ⏳ Admin vê e edita todos os dados

**Solução:**
```sql
-- Criar utilizadores de teste de cada role
INSERT INTO profiles (id, name, role, email)
VALUES
  ('UUID_1', 'Teste Encarregado', 'encarregado', 'encarregado@test.pt'),
  ('UUID_2', 'Teste Diretor', 'diretor', 'diretor@test.pt'),
  ('UUID_3', 'Teste Logistica', 'logistica', 'logistica@test.pt');
```

**Tempo:** 30 minutos

---

#### 1.3 Tratamento de Erros de Sincronização
**Problema:** Se sync falhar, utilizador pode não saber

**Melhorias necessárias:**
- ✅ Indicador visual (JÁ FEITO)
- ✅ Notificações de erro (JÁ FEITO)
- ⏳ Retry automático (falta implementar)
- ⏳ Queue de operações offline (falta implementar)

**Tempo:** 2-3 horas

---

### **PRIORIDADE 2 - IMPORTANTE** 🟡

#### 2.1 Relatório Mensal de Colaboradores
**Problema:** Precisa carregar dados de TODOS os técnicos (Admin)

**Status atual:**
- ❓ Não testado se Admin consegue ver dados de todos no relatório
- ❓ MonthlyReportView usa `timeEntries` filtrado ou não filtrado?

**Verificação necessária:**
```typescript
// App.tsx - MonthlyReportView
// Precisa usar timeEntries (RAW) não filteredTimeEntries
<MonthlyReportView
  timeEntries={timeEntries}  // ← Admin vê TUDO
  // NÃO usar filteredTimeEntries aqui!
/>
```

**Tempo:** 30 minutos

---

#### 2.2 Página de Custos por Obra
**Problema:** Diretor precisa ver TODOS os registos para calcular custos

**Status:** ❓ Não testado

**Verificação:**
- CostReportsView usa dados filtrados ou não?
- Diretor consegue ver custos de todos os técnicos?

**Tempo:** 30 minutos

---

#### 2.3 Backup Automático
**Problema:** Só tem backup manual

**Solução:**
- Implementar export automático diário (Admin)
- Enviar por email ou guardar em storage
- Notificar se backup falhar

**Tempo:** 2-3 horas

---

### **PRIORIDADE 3 - DESEJÁVEL** 🟢

#### 3.1 Real-time Sync
**Benefício:** Mudanças aparecem instantaneamente

**Implementação:**
```typescript
// Supabase Realtime
const subscription = supabase
  .channel('time_entries_changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'time_entries' },
    (payload) => {
      // Atualizar estado local
      handleRealtimeUpdate(payload)
    }
  )
  .subscribe()
```

**Tempo:** 3-4 horas

---

#### 3.2 Auditoria Completa
**Benefício:** Rastrear quem criou/editou cada registo

**Status:** Parcialmente implementado (created_by, updated_by)

**Melhorias:**
- View com histórico de alterações
- Relatório de auditoria para Admin

**Tempo:** 2-3 horas

---

#### 3.3 Validações Server-Side
**Benefício:** Segurança adicional

**Implementação:**
- Triggers no Supabase para validar dados
- Prevenir horas negativas
- Validar datas futuras
- Limitar horas máximas por dia

**Tempo:** 2-3 horas

---

## 📋 **CHECKLIST MÍNIMA PARA LANÇAMENTO:**

### Antes de Lançar em Produção:

#### Configuração Supabase
- [x] Tabela `time_entries` criada
- [x] RLS ativo
- [x] 6 políticas criadas
- [x] 7 índices criados
- [ ] Backup da base de dados configurado (Supabase Dashboard)

#### Testes de Segurança
- [x] Técnico vê apenas seus dados
- [ ] Encarregado vê todos os dados
- [ ] Diretor vê todos os dados
- [ ] Admin vê e edita todos os dados
- [ ] Técnico NÃO consegue editar dados de outros

#### Testes de Performance
- [ ] Criar 100+ registos e verificar velocidade
- [ ] Testar com 5+ utilizadores simultâneos
- [ ] Verificar tempo de carregamento (<3 segundos)
- [ ] Testar em rede lenta (3G)

#### Testes Multi-Device
- [ ] Desktop → Telemóvel (mesmo user)
- [ ] Múltiplas tabs abertas
- [ ] Offline → Online (reconexão)

#### Monitorização
- [ ] Configurar alertas de erro (Supabase Dashboard)
- [ ] Logs de auditoria ativos
- [ ] Métricas de performance visíveis

#### Backup & Recovery
- [ ] Backup manual testado (Export/Import)
- [ ] Procedimento de recovery documentado
- [ ] Backup automático configurado (se possível)

#### Documentação
- [x] Guia de configuração criado
- [ ] Manual do utilizador (técnicos)
- [ ] Manual do admin
- [ ] Troubleshooting guide

---

## 🎯 **PLANO DE AÇÃO - PRÓXIMAS 48 HORAS:**

### **Dia 1 (Hoje):**

#### Manhã (2-3 horas):
1. ✅ Resolver isolamento técnicos (FEITO)
2. ⏳ Testar com outros roles (30 min)
3. ⏳ Verificar MonthlyReportView como Admin (30 min)
4. ⏳ Criar utilizadores de teste de todos os roles (30 min)

#### Tarde (2-3 horas):
5. ⏳ Migrar dados existentes (manual ou automático)
6. ⏳ Testar com 3-5 técnicos reais
7. ⏳ Verificar relatórios com dados reais
8. ⏳ Backup antes de ir para casa

---

### **Dia 2 (Amanhã):**

#### Manhã (2-3 horas):
1. ⏳ Implementar retry automático em erros de sync
2. ⏳ Testar multi-device (desktop + telemóvel)
3. ⏳ Testar offline → online
4. ⏳ Verificar performance com muitos dados

#### Tarde (2-3 horas):
5. ⏳ Criar manual do utilizador (1 página)
6. ⏳ Fazer lançamento piloto com 5 técnicos
7. ⏳ Monitorizar erros durante 2-3 horas
8. ⏳ Ajustar o que for necessário

---

## 🚀 **CRITÉRIOS DE SUCESSO:**

### Mínimo para Lançamento Piloto:
- ✅ RLS funcional (técnicos isolados)
- ✅ Sync para Supabase funcional
- ✅ Indicador de sincronização visível
- ⏳ Testado com 3-5 técnicos
- ⏳ Backup manual funcional
- ⏳ Admin consegue ver relatório completo

### Ideal para Lançamento Total:
- ✅ Todos os itens acima
- ⏳ Retry automático implementado
- ⏳ Testado com 20+ técnicos
- ⏳ Real-time sync ativo
- ⏳ Backup automático
- ⏳ Manual do utilizador pronto

---

## 📞 **SUPORTE PÓS-LANÇAMENTO:**

### Monitorizar (Primeiras 48h):
1. **Logs de erro** no Supabase Dashboard
2. **Feedback dos técnicos** (dificuldades, bugs)
3. **Performance** (tempo de carregamento, sync)
4. **Conflitos de dados** (verificar diariamente)

### Ter à mão:
- [x] Guia de configuração (FEITO)
- [ ] Lista de FAQs
- [ ] Contacto de suporte (teu email/telefone)
- [ ] Backup da BD (sempre atualizado)

---

## 🔧 **PROBLEMAS CONHECIDOS & WORKAROUNDS:**

### 1. Sync lento em rede lenta
**Workaround:** Aumentar debounce de 1s para 3s

### 2. Erro "user_id null"
**Workaround:** Fazer logout + login

### 3. Dados não aparecem após criar
**Workaround:** Recarregar página (F5)

### 4. localStorage cheio
**Workaround:** Limpar dados antigos (manter apenas últimos 30 dias)

---

## 📊 **MÉTRICAS DE SUCESSO:**

Após 1 semana em produção:

| Métrica | Meta | Como Medir |
|---------|------|------------|
| Uptime | >99% | Supabase Dashboard |
| Tempo sync | <2s | Console do browser |
| Erros de sync | <1% | Logs do Supabase |
| Satisfação user | >80% | Inquérito rápido |
| Conflitos de dados | 0 | Query SQL diária |
| Tempo carregamento | <3s | Chrome DevTools |

---

## 🎓 **PRÓXIMOS PASSOS - AGORA:**

1. **Testar como Admin:**
   - Login como Admin
   - Ir para "Relatório Mensal"
   - Verificar se vês dados de TODOS os técnicos
   - Enviar-me o resultado

2. **Testar como Encarregado/Diretor:**
   - Criar users de teste (se não existirem)
   - Fazer login
   - Verificar se veem todos os dados
   - Enviar-me o resultado

3. **Migração de Dados:**
   - Decidir: Manual ou Automático?
   - Se manual: Exportar backups AGORA
   - Se automático: Vou criar script

---

**Data deste documento:** 2025-12-18
**Última atualização:** Após resolver isolamento de técnicos
**Status:** ✅ Sistema funcional, pronto para testes finais
