# 🔴 CORREÇÕES MOLECULARES - AUDITORIA BRUTAL

## 📊 STATUS REAL VERIFICADO:
- **Documentação**: 85-100% completo
- **Realidade**: ~20% funcional  
- **Diferença**: 65-80% de CÓDIGO FAKE

---

## 🎯 RECEITA 1: REMOVER ALERT() - NOTIFICAÇÕES PROFISSIONAIS

### PASSO#0: ESPECIFICAR EXATAMENTE
**O que implementar:** Sistema de notificações toast profissional usando react-hot-toast
**Onde usar:** Substituir TODOS os `alert()` por notificações elegantes
**Por que:** `alert()` é amador e bloqueia a UI - não é aceitável em produção

### PASSO#2: ARQUIVOS EXPLÍCITOS

#### 1. Instalar dependência
```bash
npm install react-hot-toast
```

#### 2. Arquivo: `/app/components/ToastProvider.tsx`
**Caminho completo:** `C:\Users\teste\Desktop\meuadvogado-clean\app\components\ToastProvider.tsx`
**Imports:**
```typescript
'use client'
import { Toaster } from 'react-hot-toast'
```
**Exports:**
```typescript
export default function ToastProvider()
```
**Tipos:** Nenhum tipo custom necessário

#### 3. Arquivo: `/app/layout.tsx`
**Adicionar:** Import e uso do ToastProvider
**Linha:** Dentro de `<Providers>`

#### 4. Arquivos a corrigir:
- `/app/advogado/leads/[id]/page.tsx` linha 86
- `/app/advogado/planos/page.tsx` linha 34

### PASSO#3: TESTAR IMEDIATAMENTE

**Teste 1:** Build deve compilar
```bash
npm run build
# Esperado: 0 erros TypeScript
```

**Teste 2:** Verificar sem alert()
```bash
Get-ChildItem -Path "app" -Include "*.tsx" -Recurse | Select-String -Pattern "alert\("
# Esperado: 0 resultados
```

**Erro comum:** "Module not found: Can't resolve 'react-hot-toast'"
**Correção:** Executar `npm install react-hot-toast`

---

## 🎯 RECEITA 2: CORRIGIR ANALYTICS API - DADOS REAIS

### PASSO#0: ESPECIFICAR EXATAMENTE
**O que implementar:** Queries Prisma REAIS para analytics em vez de Math.random()
**Onde:** `/app/api/analytics/dashboard/route.ts`
**Por que:** Math.random() é mentira - clientes pagantes precisam de dados verdadeiros

### PASSO#2: ARQUIVOS EXPLÍCITOS

#### 1. Arquivo: `/app/api/analytics/dashboard/route.ts`
**Caminho completo:** `C:\Users\teste\Desktop\meuadvogado-clean\app\api\analytics\dashboard\route.ts`
**Imports necessários:**
```typescript
import { prisma } from '@/lib/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
```

**Remover linhas:** 149-156 (Math.random fake data)

**Adicionar queries reais:**
```typescript
// Métricas reais do banco
const metrics = await prisma.user.aggregate({
  _count: { id: true },
  where: { role: 'CLIENT' }
})

const casesCount = await prisma.case.count({
  where: { status: 'OPEN' }
})

const conversationsCount = await prisma.conversation.count({
  where: { 
    messages: { some: {} }
  }
})
```

**Tipos:**
```typescript
interface RealMetrics {
  users: number
  cases: number  
  conversations: number
  trend: 'up' | 'down'
  change: number
}
```

### PASSO#3: TESTAR IMEDIATAMENTE

**Teste 1:** Verificar sem Math.random
```bash
Get-ChildItem -Path "app/api" -Include "*.ts" -Recurse | Select-String -Pattern "Math.random"
# Esperado: 0 resultados
```

**Teste 2:** Build compilar
```bash
npm run build
# Esperado: 0 erros
```

**Teste 3:** API retornar dados reais
```bash
curl http://localhost:3000/api/analytics/dashboard
# Esperado: JSON com números reais do banco
```

**Erro comum:** "Cannot read property of undefined"
**Correção:** Adicionar null checks e valores default

---

## 🎯 RECEITA 3: VERIFICAÇÃO DE ADMIN

### PASSO#0: ESPECIFICAR EXATAMENTE
**O que implementar:** Middleware de verificação de role ADMIN
**Onde:** `/app/api/admin/**/*` - TODOS os endpoints admin
**Por que:** Segurança crítica - qualquer um pode acessar audit logs agora

### PASSO#2: ARQUIVOS EXPLÍCITOS

#### 1. Arquivo: `/lib/auth/verify-admin.ts`
**Caminho completo:** `C:\Users\teste\Desktop\meuadvogado-clean\lib\auth\verify-admin.ts`
**Criar arquivo novo**

**Código completo:**
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from './auth-options'
import { NextResponse } from 'next/server'

export async function verifyAdmin() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Não autenticado' },
      { status: 401 }
    )
  }
  
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Acesso negado - requer role ADMIN' },
      { status: 403 }
    )
  }
  
  return null // null = permitido
}
```

#### 2. Arquivos a corrigir:
- `/app/api/admin/audit/logs/route.ts` linha 15
- `/app/api/admin/audit/reports/route.ts` linha 15

**Substituir:**
```typescript
// ANTES: linha 15
// TODO: Verificar se user é admin

// DEPOIS: linhas 15-18
const adminCheck = await verifyAdmin()
if (adminCheck) return adminCheck

// ... resto do código
```

### PASSO#3: TESTAR IMEDIATAMENTE

**Teste 1:** Verificar sem TODO
```bash
Get-ChildItem -Path "app/api/admin" -Include "*.ts" -Recurse | Select-String -Pattern "TODO"
# Esperado: 0 resultados
```

**Teste 2:** Endpoint rejeitar não-admin
```bash
# Sem token
curl http://localhost:3000/api/admin/audit/logs
# Esperado: 401 Unauthorized

# Com token CLIENT
curl -H "Authorization: Bearer CLIENT_TOKEN" http://localhost:3000/api/admin/audit/logs
# Esperado: 403 Forbidden

# Com token ADMIN
curl -H "Authorization: Bearer ADMIN_TOKEN" http://localhost:3000/api/admin/audit/logs
# Esperado: 200 OK com dados
```

**Erro comum:** "authOptions is not defined"
**Correção:** Verificar import correto de `@/lib/auth/auth-options`

---

## 🎯 RECEITA 4: UPLOAD SALVAR NO BANCO

### PASSO#0: ESPECIFICAR EXATAMENTE
**O que implementar:** Persistir uploads na tabela File do Prisma
**Onde:** `/app/api/upload/route.ts` linha 27
**Por que:** Arquivos não são rastreados - perda de dados e problemas de auditoria

### PASSO#2: ARQUIVOS EXPLÍCITOS

#### 1. Verificar schema Prisma
**Arquivo:** `/prisma/schema.prisma`
**Verificar se existe:**
```prisma
model File {
  id        String   @id @default(cuid())
  url       String
  key       String
  name      String
  size      Int
  type      String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}
```

**Se não existir:** Adicionar ao schema e rodar `npx prisma db push`

#### 2. Arquivo: `/app/api/upload/route.ts`
**Substituir linha 27:**
```typescript
// ANTES:
// TODO: Salvar no banco de dados após rodar prisma db push

// DEPOIS: linhas 27-38
const file = await prisma.file.create({
  data: {
    url: data.url,
    key: data.key,
    name: formData.get('file').name,
    size: formData.get('file').size,
    type: formData.get('file').type,
    userId: session.user.id,
  }
})

return NextResponse.json({ 
  success: true, 
  file: {
    id: file.id,
    url: file.url,
    name: file.name
  }
})
```

### PASSO#3: TESTAR IMEDIATAMENTE

**Teste 1:** Schema atualizado
```bash
npx prisma db push
# Esperado: "The database is already in sync"
```

**Teste 2:** Upload funcionar
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test.pdf"
# Esperado: JSON com id, url, name
```

**Teste 3:** Arquivo no banco
```bash
npx prisma studio
# Verificar: Tabela File tem registro novo
```

**Erro comum:** "Property 'name' does not exist on type FormDataEntryValue"
**Correção:** Cast para File: `const file = formData.get('file') as File`

---

## 🎯 RECEITA 5: MATCH DE LEADS

### PASSO#0: ESPECIFICAR EXATAMENTE
**O que implementar:** Sistema de match entre Lead e Lawyer
**Onde:** `/app/api/advogado/leads/[id]/accept/route.ts` linha 90
**Por que:** Aceitar lead não cria conexão - advogado perde o lead

### PASSO#2: ARQUIVOS EXPLÍCITOS

#### 1. Schema Prisma - Verificar models
**Arquivo:** `/prisma/schema.prisma`
**Verificar:**
```prisma
model Lead {
  id           String   @id @default(cuid())
  status       String   // 'PENDING', 'MATCHED', 'CLOSED'
  lawyerId     String?
  lawyer       User?    @relation(fields: [lawyerId], references: [id])
  // ... outros campos
}

model LeadView {
  id        String   @id @default(cuid())
  leadId    String
  lead      Lead     @relation(fields: [leadId], references: [id])
  lawyerId  String
  lawyer    User     @relation(fields: [lawyerId], references: [id])
  viewedAt  DateTime @default(now())
}
```

#### 2. Arquivo: `/app/api/advogado/leads/[id]/accept/route.ts`
**Substituir linha 90:**
```typescript
// ANTES:
// TODO: Criar match e registrar view após adicionar models ao schema

// DEPOIS: linhas 90-115
// Atualizar lead com match
const lead = await prisma.lead.update({
  where: { id: params.id },
  data: {
    status: 'MATCHED',
    lawyerId: session.user.id,
    matchedAt: new Date()
  }
})

// Registrar view
await prisma.leadView.create({
  data: {
    leadId: params.id,
    lawyerId: session.user.id,
    viewedAt: new Date()
  }
})

// Criar conversa automaticamente
const conversation = await prisma.conversation.create({
  data: {
    clientId: lead.userId,
    lawyerId: session.user.id,
    status: 'ACTIVE'
  }
})

return NextResponse.json({ 
  success: true,
  lead,
  conversationId: conversation.id
})
```

### PASSO#3: TESTAR IMEDIATAMENTE

**Teste 1:** Aceitar lead
```bash
curl -X POST http://localhost:3000/api/advogado/leads/LEAD_ID/accept
# Esperado: JSON com success: true, conversationId
```

**Teste 2:** Verificar no banco
```bash
npx prisma studio
# Lead: status = 'MATCHED', lawyerId preenchido
# LeadView: registro criado
# Conversation: criada automaticamente
```

**Teste 3:** Build sem erros
```bash
npm run build
# Esperado: 0 erros
```

**Erro comum:** "Unique constraint failed on leadId"
**Correção:** Adicionar `@@unique([leadId, lawyerId])` no model LeadView

---

## 📊 CHECKLIST FINAL

### Antes de dizer "pronto":
- [ ] `npm run build` = 0 erros
- [ ] `Get-ChildItem | Select-String "TODO"` = 0 resultados
- [ ] `Get-ChildItem | Select-String "alert\("` = 0 resultados  
- [ ] `Get-ChildItem | Select-String "Math.random"` = 0 resultados
- [ ] Testar fluxo manual de cada receita
- [ ] Verificar dados no `npx prisma studio`

### Provas necessárias:
1. Screenshot do build sucesso
2. Screenshot do prisma studio com dados reais
3. Teste manual gravado de cada fluxo
4. Código sem TODOs, alerts, Math.random

---

**IMPLEMENTAR RECEITA POR RECEITA - NÃO PULAR ETAPAS**
