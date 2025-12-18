# 🧪 TESTES - CORREÇÃO #1: Filtros por Role

## 📋 **O QUE FOI CORRIGIDO:**

### Bug #1: filteredTimeEntries filtrava por NOME para todos
**Antes:** Admin só via registos onde aparece como worker/supervisor
**Depois:** Admin vê TODOS os registos ✅

### Bug #2: ProfileView fazia segundo filtro por nome
**Antes:** Mesmo recebendo todos os dados, ProfileView filtrava por nome
**Depois:** ProfileView mostra todos os dados recebidos ✅

---

## 🎯 **TESTES A EXECUTAR:**

### **PRÉ-REQUISITOS:**
1. Ter pelo menos 2 técnicos com registos diferentes
2. Ter 1 Admin configurado
3. Ter 1 Encarregado (pode usar técnico com role mudado)

---

## **TESTE 1: Técnico vê apenas seus dados** ✅

### Objetivo: Confirmar isolamento funciona

**Passos:**
1. Login como **Técnico 1**
2. Abrir **Console do browser** (F12 → Console)
3. Procurar por:
   ```
   🔒 [tecnico] Acesso FILTRADO: X/Y registos
   ```

**Resultado Esperado:**
- ✅ X = número de registos do Técnico 1
- ✅ Y = total de registos no sistema
- ✅ X < Y (técnico não vê todos)

4. Ir para **Meu Perfil**
5. Verificar dashboard:
   - ✅ Mostra apenas dados do Técnico 1
   - ✅ Horas totais correspondem aos seus registos

6. Verificar calendário:
   - ✅ Apenas dias do Técnico 1 aparecem

**REPORTAR:**
- [ ] Console mostra log correto?
- [ ] Dashboard mostra apenas seus dados?
- [ ] Quantos registos foram carregados? (X/Y)

---

## **TESTE 2: Admin vê TODOS os dados** 🔑

### Objetivo: Confirmar que Admin tem acesso total

**Passos:**
1. Criar alguns registos como **Técnico 1** (ex: 2 dias, 16h)
2. Criar alguns registos como **Técnico 2** (ex: 2 dias, 18h)
3. Fazer **logout** de ambos
4. Login como **Admin**
5. Abrir **Console** (F12)
6. Procurar por:
   ```
   🔓 [admin] Acesso TOTAL: Y registos
   ```

**Resultado Esperado:**
- ✅ Y = total de TODOS os registos (Técnico 1 + Técnico 2 + outros)
- ✅ NÃO deve aparecer "Acesso FILTRADO"

7. Ir para **Meu Perfil**
8. Verificar dashboard:
   - ✅ "Visão Geral do Mês" mostra **SOMA de todos os técnicos**
   - ✅ Exemplo: Se Técnico 1 = 16h e Técnico 2 = 18h → Total = 34h

9. Ir para **Relatório Mensal de Colaboradores**
10. Verificar:
    - ✅ Aparecem TODOS os técnicos
    - ✅ Cada técnico tem suas horas corretas
    - ✅ Totais estão corretos

**REPORTAR:**
- [ ] Console mostra "Acesso TOTAL"?
- [ ] Quantos registos foram carregados?
- [ ] Meu Perfil mostra soma de todos?
- [ ] Relatório Mensal mostra todos os técnicos?
- [ ] Screenshot do Meu Perfil (Dashboard)

---

## **TESTE 3: Encarregado vê TODOS os dados** 👥

### Objetivo: Confirmar que Encarregado tem mesmos acessos que Admin

**Passos:**
1. Mudar role de um técnico para encarregado:
   ```sql
   UPDATE profiles
   SET role = 'encarregado'
   WHERE email = 'tecnico3@empresa.pt';
   ```

2. Fazer **logout** do técnico
3. Limpar localStorage:
   ```javascript
   localStorage.clear()
   ```
4. Fazer **login** como Encarregado (ex-técnico)
5. Abrir **Console** (F12)
6. Procurar por:
   ```
   🔓 [encarregado] Acesso TOTAL: Y registos
   ```

**Resultado Esperado:**
- ✅ Vê TODOS os registos (mesmo número que Admin)
- ✅ Meu Perfil mostra dados de todos
- ✅ Não está limitado aos seus registos antigos

7. Ir para **Meu Perfil**
8. Verificar:
   - ✅ Dashboard mostra soma de TODOS
   - ✅ Calendário mostra dias de TODOS os técnicos

**REPORTAR:**
- [ ] Console mostra "Acesso TOTAL"?
- [ ] Encarregado vê todos os registos?
- [ ] Dashboard mostra soma correta?

---

## **TESTE 4: Diretor vê TODOS os dados** 📊

### Objetivo: Confirmar que Diretor tem acesso total (especialmente para relatórios de custos)

**Passos:**
1. Mudar role para diretor:
   ```sql
   UPDATE profiles
   SET role = 'diretor'
   WHERE email = 'tecnico4@empresa.pt';
   ```

2. Login como **Diretor**
3. Verificar Console:
   ```
   🔓 [diretor] Acesso TOTAL: Y registos
   ```

4. Ir para **Custos por Obra** (se tiver acesso)
5. Verificar:
   - ✅ Vê custos de TODOS os técnicos
   - ✅ Totais incluem todos os colaboradores

**REPORTAR:**
- [ ] Diretor vê todos os registos?
- [ ] Relatórios de custos incluem todos?

---

## **TESTE 5: Verificação Cruzada** 🔄

### Objetivo: Confirmar que dados são consistentes

**Passos:**
1. Criar 1 registo como **Técnico 1** (hoje, 8h, Projeto A)
2. Verificar no **Supabase**:
   ```sql
   SELECT
     worker,
     date,
     hours,
     project,
     user_id
   FROM time_entries
   WHERE date = CURRENT_DATE
   ORDER BY created_at DESC
   LIMIT 5;
   ```

3. Login como **Admin**
4. Ir para **Meu Perfil**
5. Verificar se o registo do Técnico 1 aparece no dashboard
6. Ir para **Relatório Mensal**
7. Verificar se o registo aparece no relatório

**Resultado Esperado:**
- ✅ Registo no Supabase tem `user_id` do Técnico 1
- ✅ Admin vê o registo no Meu Perfil
- ✅ Admin vê o registo no Relatório Mensal

**REPORTAR:**
- [ ] Registo tem user_id correto?
- [ ] Admin vê o registo em Meu Perfil?
- [ ] Admin vê o registo no Relatório Mensal?

---

## **TESTE 6: Performance com Muitos Dados** ⚡

### Objetivo: Verificar que não há lentidão

**Passos:**
1. Como Admin, abrir **Meu Perfil**
2. Verificar tempo de carregamento:
   - Abrir **Network tab** (F12 → Network)
   - Recarregar página (F5)
   - Verificar tempo até "DOMContentLoaded"

**Resultado Esperado:**
- ✅ Carregamento < 3 segundos
- ✅ Sem erros no console
- ✅ Interface responsiva

**REPORTAR:**
- [ ] Tempo de carregamento (segundos)?
- [ ] Algum lag ou lentidão?
- [ ] Quantos registos totais no sistema?

---

## 📊 **TEMPLATE DE REPORT:**

Copia e preenche:

```
## RESULTADOS DOS TESTES - Correção #1

### TESTE 1: Técnico (Isolamento)
- Console: 🔒 [tecnico] X/Y registos → X=___ Y=___
- Meu Perfil mostra apenas seus dados: [ ] Sim [ ] Não
- Problemas encontrados: ___

### TESTE 2: Admin (Acesso Total)
- Console: 🔓 [admin] Y registos → Y=___
- Meu Perfil mostra soma de todos: [ ] Sim [ ] Não
- Total de horas no dashboard: ___h (esperado: soma de todos)
- Relatório Mensal mostra todos: [ ] Sim [ ] Não
- Problemas encontrados: ___

### TESTE 3: Encarregado
- Console: 🔓 [encarregado] Y registos → Y=___
- Vê todos os dados: [ ] Sim [ ] Não
- Problemas encontrados: ___

### TESTE 4: Diretor
- Console: 🔓 [diretor] Y registos → Y=___
- Relatórios de custos incluem todos: [ ] Sim [ ] Não
- Problemas encontrados: ___

### TESTE 5: Verificação Cruzada
- Registo tem user_id correto: [ ] Sim [ ] Não
- Admin vê em Meu Perfil: [ ] Sim [ ] Não
- Admin vê no Relatório: [ ] Sim [ ] Não
- Problemas encontrados: ___

### TESTE 6: Performance
- Tempo de carregamento: ___ segundos
- Total de registos: ___
- Lag ou lentidão: [ ] Sim [ ] Não
- Problemas encontrados: ___

### BUGS ADICIONAIS ENCONTRADOS:
1. ___
2. ___
3. ___

### SCREENSHOTS:
- [ ] Meu Perfil (Admin com dados de todos)
- [ ] Console (logs de acesso)
- [ ] Relatório Mensal (todos os técnicos)
```

---

## ✅ **CRITÉRIOS DE SUCESSO:**

Para considerar esta correção APROVADA:

- ✅ Técnicos veem apenas seus dados (X < Y no console)
- ✅ Admin vê TODOS os dados (Y total no console)
- ✅ Encarregado vê TODOS os dados
- ✅ Diretor vê TODOS os dados
- ✅ Meu Perfil (Admin) mostra soma de todos os técnicos
- ✅ Relatório Mensal mostra todos os técnicos
- ✅ Performance aceitável (< 3s de carregamento)
- ✅ Sem erros no console

---

## 🚀 **APÓS COMPLETAR OS TESTES:**

1. Preencher o template de report acima
2. Enviar-me o report completo
3. Se TODOS os testes passarem → Avançamos para **Correção #2**
4. Se houver bugs → Corrijo imediatamente antes de avançar

---

**Commit:** `94b2f95` - 🔧 Corrigir filtros: Admin/Encarregado veem TODOS os dados
**Build:** ✅ 479.80 kB
**Status:** ⏳ Aguardando testes
