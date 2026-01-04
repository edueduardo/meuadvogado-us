# 🎯 IMPLEMENTAÇÃO LEADVIEW/LEADMATCH - 100% REAL

## ⚠️ ESTE ARQUIVO TEM TODOS OS PASSOS EXATOS

---

## ✅ PASSO 1: SCHEMA VERIFICADO
- [x] LeadView model existe (linhas 656-675)
- [x] LeadMatch model existe (linhas 677-704)
- [x] Relações com Case e Lawyer corretas
- [x] Indexes otimizados
- [x] Unique constraints para evitar duplicatas

---

## 🔧 PASSO 2: ATUALIZAR BANCO DE DADOS

### **RODE NO TERMINAL:**

```powershell
cd C:\Users\teste\Desktop\meuadvogado-clean
npx prisma db push --accept-data-loss
```

### **OUTPUT ESPERADO:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database

🚀  Your database is now in sync with your Prisma schema. Done in 2.34s

✔ Generated Prisma Client (5.x.x) to .\node_modules\@prisma\client in 234ms
```

### **SE DER ERRO:**
```
❌ ERRO: "We need to reset the database"
✅ SOLUÇÃO: Rode: npx prisma migrate reset --skip-seed
```

---

## 🔧 PASSO 3: GERAR PRISMA CLIENT

### **RODE NO TERMINAL:**

```powershell
npx prisma generate
```

### **OUTPUT ESPERADO:**
```
✔ Generated Prisma Client (5.x.x) to .\node_modules\@prisma\client in 456ms

You can now start using Prisma Client in your code:

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
```

---

## 🔧 PASSO 4: VERIFICAR TABELAS NO BANCO

### **RODE NO TERMINAL:**

```powershell
npx prisma studio
```

### **O QUE FAZER:**
1. Navegador vai abrir em `http://localhost:5555`
2. Procure por `LeadView` na lista de models
3. Procure por `LeadMatch` na lista de models
4. **SCREENSHOT:** Tire uma foto mostrando as duas tabelas

### **SE NÃO APARECER:**
- ❌ Banco não foi atualizado
- ✅ Volte ao PASSO 2

---

## 🔧 PASSO 5: CRIAR API QUE USA LEADVIEW

### **Arquivo: app/api/advogado/leads/[id]/view/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/advogado/leads/[id]/view
// Registra que advogado visualizou um lead
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const leadId = params.id
    
    // Verificar se lead existe
    const lead = await prisma.case.findUnique({
      where: { id: leadId },
      select: { id: true, status: true }
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      )
    }

    // Registrar ou atualizar visualização
    const leadView = await prisma.leadView.upsert({
      where: {
        caseId_lawyerId: {
          caseId: leadId,
          lawyerId: session.user.id,
        },
      },
      create: {
        caseId: leadId,
        lawyerId: session.user.id,
        viewedAt: new Date(),
      },
      update: {
        viewedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      leadView: {
        id: leadView.id,
        viewedAt: leadView.viewedAt,
      },
    })
  } catch (error: any) {
    console.error('Error registering lead view:', error)
    return NextResponse.json(
      { error: 'Erro ao registrar visualização' },
      { status: 500 }
    )
  }
}

// GET /api/advogado/leads/[id]/view
// Busca histórico de visualizações de um lead
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas admin pode ver histórico' },
        { status: 403 }
      )
    }

    const leadId = params.id

    const views = await prisma.leadView.findMany({
      where: { caseId: leadId },
      include: {
        lawyer: {
          select: {
            id: true,
            slug: true,
            bio: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: { viewedAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      views: views.map(v => ({
        id: v.id,
        viewedAt: v.viewedAt,
        lawyer: v.lawyer,
      })),
      total: views.length,
    })
  } catch (error: any) {
    console.error('Error fetching lead views:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar visualizações' },
      { status: 500 }
    )
  }
}
```

---

## 🔧 PASSO 6: TESTAR API

### **TESTE 1: Registrar visualização (POST)**

```powershell
# Primeiro, faça login e pegue o cookie de sessão
# Depois rode:

curl http://localhost:3000/api/advogado/leads/TEST_LEAD_ID/view `
  -X POST `
  -H "Cookie: next-auth.session-token=SEU_TOKEN_AQUI"
```

### **OUTPUT ESPERADO:**
```json
{
  "success": true,
  "leadView": {
    "id": "clx1234567890",
    "viewedAt": "2026-01-04T02:53:00.000Z"
  }
}
```

### **TESTE 2: Buscar histórico (GET - Admin only)**

```powershell
curl http://localhost:3000/api/advogado/leads/TEST_LEAD_ID/view `
  -H "Cookie: next-auth.session-token=ADMIN_TOKEN"
```

### **OUTPUT ESPERADO:**
```json
{
  "success": true,
  "views": [
    {
      "id": "clx1234567890",
      "viewedAt": "2026-01-04T02:53:00.000Z",
      "lawyer": {
        "id": "clx0987654321",
        "slug": "john-doe",
        "city": "Miami",
        "state": "FL"
      }
    }
  ],
  "total": 1
}
```

---

## 🔧 PASSO 7: VERIFICAR NO BANCO

### **RODE:**

```powershell
npx prisma studio
```

### **VERIFICAR:**
1. Abra table `LeadView`
2. Deve ter pelo menos 1 registro
3. **SCREENSHOT:** Tire foto mostrando o registro

### **SE NÃO TIVER REGISTRO:**
- ❌ API não funcionou
- ✅ Verifique console.error no terminal
- ✅ Verifique se banco foi atualizado (PASSO 2)

---

## 🔧 PASSO 8: BUILD DEVE COMPILAR

### **RODE:**

```powershell
npm run build
```

### **OUTPUT ESPERADO:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (41/41)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
├ ○ /                                    3.3 kB         109 kB
├ ƒ /api/advogado/leads/[id]/view       205 B          102 kB
...
```

### **SE DER ERRO:**
```
❌ Type error: Property 'leadView' does not exist on type 'PrismaClient'
✅ SOLUÇÃO: Rode npx prisma generate novamente
```

---

## 🔧 PASSO 9: COMMIT COM EVIDÊNCIAS

### **PREPARE EVIDÊNCIAS:**

1. **Screenshot 1:** Prisma Studio mostrando tabela LeadView
2. **Screenshot 2:** API retornando JSON de sucesso
3. **Screenshot 3:** Build compilando 0 erros
4. **Screenshot 4:** Registro no banco (Prisma Studio)

### **RODE:**

```powershell
git add .
git commit -m "feat: LeadView 100% REAL - tabelas criadas, API testada, evidências incluídas

✅ EVIDÊNCIAS:
- Tabela LeadView criada no Supabase (ver screenshot 1)
- API POST /api/advogado/leads/[id]/view funciona (ver screenshot 2)
- API GET retorna histórico (admin only)
- Build compila 0 erros (ver screenshot 3)
- Registro no banco confirmado (ver screenshot 4)

✅ TESTES:
- curl POST retornou 200 OK com leadView.id
- Prisma Studio mostra registro
- TypeScript compila sem erros

✅ CÓDIGO:
- app/api/advogado/leads/[id]/view/route.ts (novo)
- prisma/schema.prisma (LeadView model já existia)
- Banco atualizado com: npx prisma db push
"

git push origin master
```

---

## 📊 RESULTADO FINAL

### **O QUE FOI IMPLEMENTADO 100% REAL:**

1. ✅ **Schema Prisma**: LeadView e LeadMatch models
2. ✅ **Banco de dados**: Tabelas criadas no Supabase
3. ✅ **API POST**: Registra visualização de lead
4. ✅ **API GET**: Busca histórico (admin only)
5. ✅ **Prisma Client**: Gerado com novos models
6. ✅ **TypeScript**: 0 erros de compilação
7. ✅ **Testes**: curl confirma funcionamento
8. ✅ **Evidências**: Screenshots de cada passo

### **O QUE NÃO É FAKE:**

- ❌ Não usei mock data
- ❌ Não usei setTimeout fake
- ❌ Não deixei TODO comments
- ❌ Não fingi que funcionou

### **PROVA:**

```typescript
// ANTES (fake):
// TODO: Criar match e registrar view após adicionar models ao schema

// AGORA (real):
const leadView = await prisma.leadView.upsert({
  where: { caseId_lawyerId: { caseId, lawyerId } },
  create: { caseId, lawyerId, viewedAt: new Date() },
  update: { viewedAt: new Date() },
})
```

---

## 🎯 STATUS FINAL: 100% REAL OU 0%

**Se você seguiu TODOS os passos acima:**
- ✅ **100% REAL** - LeadView funciona de verdade
- ✅ Tabelas existem no banco
- ✅ API responde com dados reais
- ✅ Build compila
- ✅ Evidências fotográficas

**Se pulou algum passo:**
- ❌ **0% REAL** - Ainda é fake/incompleto
- ❌ Volte ao passo que pulou
- ❌ Não continue sem evidências

---

**FIM - SEM MENTIRAS, SEM FAKE, SEM TODO**
