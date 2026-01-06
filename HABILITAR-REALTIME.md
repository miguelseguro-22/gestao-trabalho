# 🔴 HABILITAR REALTIME NO SUPABASE

## Problema Identificado

O registo criado no telemóvel NÃO aparece automaticamente no PC do admin porque o **Realtime não está habilitado** na tabela `time_entries`.

## ⚠️ IMPORTANTE: Isto NÃO é feito por SQL!

O Realtime é configurado na **interface web do Supabase Dashboard**.

---

## 📋 PASSO A PASSO

### 1️⃣ Ir ao Supabase Dashboard

1. Abre o browser
2. Vai para: https://supabase.com/dashboard
3. Faz login
4. Seleciona o teu projeto

### 2️⃣ Habilitar Realtime

1. No menu lateral esquerdo, clica em **"Database"**
2. Clica em **"Replication"** (ou "Publications")
3. Procura a tabela **`time_entries`**
4. Verifica se tem uma checkbox ou toggle para **"Realtime"** ou **"Enable Realtime"**
5. **ATIVA** essa opção
6. Clica em **"Save"** ou **"Update"**

---

## 🎯 O que isto faz?

Quando o Realtime está ativo:
- ✅ Técnico cria registo no telemóvel → **IMEDIATAMENTE** visível no PC do admin
- ✅ Admin edita registo no PC → **IMEDIATAMENTE** atualizado no telemóvel do técnico
- ✅ Sem precisar dar refresh (F5)

Quando o Realtime NÃO está ativo:
- ❌ Técnico cria registo no telemóvel → Admin **SÓ VÊ** depois de dar refresh (F5)
- ❌ Dados estão gravados corretamente, mas não sincronizam em tempo real

---

## 🔍 Como confirmar que está ativo?

Depois de habilitar o Realtime:

1. **No telemóvel** (conta de técnico):
   - Abre a app
   - Abre a Consola do browser (F12)
   - Procura por: `"🔴 Ativando Realtime para time_entries"`
   - Deve aparecer uma mensagem de sucesso

2. **No PC** (conta de admin):
   - Abre a app
   - Abre a Consola do browser (F12)
   - Cria um registo no telemóvel
   - Procura por: `"🔴 Mudança detectada em time_entries"`
   - Se aparecer → **FUNCIONA!** ✅
   - Se NÃO aparecer → Realtime ainda não está ativo

---

## 🐛 Se ainda não funcionar depois de habilitar

Execute estes testes:

### Teste 1: Verificar se Supabase está configurado corretamente

Abre a Consola do browser (F12) e executa:
```javascript
console.log('Supabase ready?', window.supabaseReady);
console.log('Supabase client?', !!window.supabase);
```

Deve retornar:
```
Supabase ready? true
Supabase client? true
```

### Teste 2: Verificar se o canal Realtime está subscrito

Na Consola do browser:
```javascript
// Isto deve estar no código App.tsx linha ~9397
```

Procura por mensagens como:
- `"🔴 Ativando Realtime para time_entries..."`
- `"SUBSCRIBED"` (estado do canal)

---

## 📞 Se continuar a falhar

Envia-me:
1. Screenshot do Supabase Dashboard → Database → Replication (mostrando `time_entries`)
2. Resultado do script `DIAGNOSTICO-COMPLETO.sql`
3. Screenshot da Consola do browser (F12) com os logs do Realtime

---

## ✅ Depois de habilitar o Realtime

Execute também o script **`CORRECAO-RLS-FINAL.sql`** para garantir que as políticas de acesso estão corretas!

Os dois problemas (Realtime + RLS) podem estar a causar o problema simultaneamente.
