# 📋 RECEITAS EXATAS - FORMATO PASSO#0

## Para cada feature, seguir EXATAMENTE esta estrutura:
1. **PASSO#0**: Especificação exata
2. **PASSO#2**: Arquivos explícitos
3. **PASSO#3**: Testes imediatos

---

# 🔐 RECEITA 1: SISTEMA DE AUTENTICAÇÃO

## PASSO#0: ESPECIFICAR EXATAMENTE
```
"Quero implementar [AUTENTICAÇÃO NEXTAUTH COMPLETA] que faz [login com email/senha, login com Google, cadastro, logout, persistência de sessão, proteção de rotas] 
usando [NextAuth.js v5 + Prisma Adapter + bcryptjs + JWT Strategy] armazenando em [PostgreSQL via Supabase na tabela users, accounts, sessions] 
com validações [email único no banco, email formato válido, senha mínimo 8 caracteres, confirmação de senha igual, role válido (CLIENT|LAWYER)] 
e retornando [JWT Session contendo { user: { id: string, name: string, email: string, role: UserRole } }]"
```

## PASSO#2: ARQUIVOS EXPLÍCITOS

### Arquivo 1: `/lib/auth.ts`
```
Caminho: /lib/auth.ts
Imports:
  - { PrismaAdapter } from "@auth/prisma-adapter"
  - { NextAuthOptions } from "next-auth"
  - CredentialsProvider from "next-auth/providers/credentials"
  - GoogleProvider from "next-auth/providers/google"
  - bcrypt from "bcryptjs"
  - { prisma } from "./prisma"

Exports:
  - authOptions: NextAuthOptions

Tipos:
  - ExtendedUser: { id: string; name: string; email: string; role: "CLIENT" | "LAWYER" | "ADMIN" }
  - ExtendedSession: Session & { user: ExtendedUser }
```

### Arquivo 2: `/app/api/auth/[...nextauth]/route.ts`
```
Caminho: /app/api/auth/[...nextauth]/route.ts
Imports:
  - NextAuth from "next-auth"
  - { authOptions } from "@/lib/auth"

Exports:
  - handler as GET
  - handler as POST

Tipos: (implícito do NextAuth)
```

### Arquivo 3: `/app/api/auth/register/route.ts`
```
Caminho: /app/api/auth/register/route.ts
Imports:
  - { NextRequest, NextResponse } from "next/server"
  - bcrypt from "bcryptjs"
  - { prisma } from "@/lib/prisma"
  - { z } from "zod"

Exports:
  - POST: (request: NextRequest) => Promise<NextResponse>

Tipos:
  - RegisterSchema: z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8),
      phone: z.string().optional(),
      role: z.enum(["CLIENT", "LAWYER"]).default("CLIENT")
    })
```

### Arquivo 4: `/middleware.ts`
```
Caminho: /middleware.ts (na RAIZ do projeto)
Imports:
  - { withAuth } from "next-auth/middleware"
  - { NextResponse } from "next/server"

Exports:
  - default: middleware function
  - config: { matcher: ["/dashboard/:path*", "/cliente/:path*", "/login", "/cadastro"] }

Tipos: (implícito do NextAuth)
```

### Arquivo 5: `/prisma/schema.prisma` (MODIFICAR)
```
ADICIONAR após model User existente:

enum UserRole {
  CLIENT
  LAWYER
  ADMIN
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
  @@map("verification_tokens")
}

MODIFICAR model User:
  ADICIONAR: password String?
  ADICIONAR: emailVerified DateTime?
  ADICIONAR: role UserRole @default(CLIENT)
  ADICIONAR: accounts Account[]
  ADICIONAR: sessions Session[]
```

## PASSO#3: TESTES IMEDIATOS
```bash
# 1. Instalar dependências
npm install next-auth@latest @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs

# 2. Gerar Prisma
npx prisma generate
npx prisma db push

# 3. Build
npm run build

# ERROS E CORREÇÕES:
Se erro "Cannot find module 'next-auth'" 
  → Verifique package.json, rode npm install novamente

Se erro "Cannot find module '@auth/prisma-adapter'" 
  → npm install @auth/prisma-adapter

Se erro "Type 'string' is not assignable to type 'UserRole'" 
  → Verifique se enum UserRole está no schema

Se erro "Property 'password' does not exist on type 'User'" 
  → Rode npx prisma generate novamente

Se erro "NEXTAUTH_SECRET is not defined" 
  → Adicione NEXTAUTH_SECRET=sua-chave-secreta no .env.local

Se erro "NEXTAUTH_URL is not defined" 
  → Adicione NEXTAUTH_URL=http://localhost:3000 no .env.local

# 4. Teste manual
npm run dev
# Acesse http://localhost:3000/cadastro
# Crie uma conta
# Verifique no banco: npx prisma studio → tabela users
# Acesse /login
# Faça login com as credenciais
# Deve redirecionar para /dashboard
```

---

# 📊 RECEITA 2: DASHBOARD COM DADOS REAIS

## PASSO#0: ESPECIFICAR EXATAMENTE
```
"Quero implementar [DASHBOARD DO ADVOGADO COM DADOS REAIS DO BANCO] que faz [buscar perfil do usuário logado, listar leads recebidos, mostrar estatísticas de views e conversão, exibir ações rápidas] 
usando [Next.js 14 App Router + Server Components + Prisma + getServerSession] armazenando em [PostgreSQL tabelas users, lawyer_profiles, leads] 
com validações [usuário autenticado via sessão, role igual a LAWYER, userId existe no banco] 
e retornando [DashboardData { lawyer: LawyerProfile, recentLeads: Lead[], stats: { viewsToday, viewsThisWeek, viewsThisMonth, leadsToday, leadsThisWeek, leadsThisMonth } }]"
```

## PASSO#2: ARQUIVOS EXPLÍCITOS

### Arquivo 1: `/app/api/dashboard/route.ts` (REESCREVER)
```
Caminho: /app/api/dashboard/route.ts
Imports:
  - { NextResponse } from "next/server"
  - { getServerSession } from "next-auth"
  - { authOptions } from "@/lib/auth"
  - { prisma } from "@/lib/prisma"

Exports:
  - GET: () => Promise<NextResponse>

Tipos:
  - DashboardData: {
      lawyer: {
        user: { name: string; email: string; plan: string; verified: boolean };
        views: number;
        leadsThisMonth: number;
        totalLeads: number;
      };
      recentLeads: Array<{
        id: string;
        name: string;
        email: string;
        phone?: string;
        message: string;
        status: string;
        createdAt: string;
      }>;
      stats: {
        viewsToday: number;
        viewsThisWeek: number;
        viewsThisMonth: number;
        leadsToday: number;
        leadsThisWeek: number;
        leadsThisMonth: number;
      };
    }

REMOVER COMPLETAMENTE:
  - const userId = 'temp-user-id'
  - Math.floor(Math.random() * ...)

ADICIONAR:
  - const session = await getServerSession(authOptions)
  - if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  - const userId = (session.user as any).id
```

### Arquivo 2: `/app/dashboard/page.tsx` (REESCREVER)
```
Caminho: /app/dashboard/page.tsx
Imports:
  - { useState, useEffect } from "react"
  - Link from "next/link"
  - { useSession, signOut } from "next-auth/react"
  - { useRouter } from "next/navigation"

Exports:
  - default DashboardPage

Tipos:
  - DashboardData (mesmo da API)

REMOVER COMPLETAMENTE:
  - const mockData: DashboardData = { ... } (todo o bloco de 40 linhas)
  - setData(mockData)

ADICIONAR:
  - const { data: session, status } = useSession()
  - useEffect para redirecionar se não autenticado
  - fetch('/api/dashboard') real
  - Botão "Sair" com onClick={() => signOut()}
```

## PASSO#3: TESTES IMEDIATOS
```bash
# 1. Build
npm run build

# ERROS E CORREÇÕES:
Se erro "getServerSession is not a function"
  → import { getServerSession } from "next-auth"

Se erro "authOptions is not defined"
  → Verifique se /lib/auth.ts existe e exporta authOptions

Se erro 401 Unauthorized no fetch
  → Verifique se a sessão está ativa, se middleware permite a rota

Se dados ainda são mockados
  → Verifique se removeu const mockData e setData(mockData)

# 2. Teste manual
npm run dev
# Login com usuário existente
# Acesse /dashboard
# VERIFICAR: Nome deve ser do usuário logado (não "Dr. João Silva")
# VERIFICAR: Leads devem vir do banco real
# VERIFICAR: Botão "Sair" deve fazer logout
```

---

# 📝 RECEITA 3: CADASTRO FUNCIONAL

## PASSO#0: ESPECIFICAR EXATAMENTE
```
"Quero implementar [CADASTRO DE USUÁRIO QUE SALVA NO BANCO] que faz [validar dados, verificar email único, criar hash de senha, salvar usuário, criar LawyerProfile se for advogado, redirecionar para login] 
usando [React Hook Form + Zod + fetch para API + bcryptjs] armazenando em [PostgreSQL tabela users + lawyer_profiles] 
com validações [nome mínimo 2 chars, email válido e único, senha mínimo 8 chars, confirmação igual, role válido] 
e retornando [{ success: true, user: { id, name, email, role } } ou { error: string }]"
```

## PASSO#2: ARQUIVOS EXPLÍCITOS

### Arquivo: `/app/cadastro/page.tsx` (MODIFICAR)
```
Caminho: /app/cadastro/page.tsx

REMOVER (linhas 70-76):
  - // TODO: Implementar cadastro
  - console.log('Cadastro:', formData)
  - alert('Cadastro realizado com sucesso!...')
  - alert('Erro ao fazer cadastro...')

ADICIONAR no handleSubmit:
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: formData.userType,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    setErrors({ general: data.error || 'Erro ao criar conta' });
    return;
  }

  // Sucesso - redirecionar para login
  router.push('/login?registered=true');
```

## PASSO#3: TESTES IMEDIATOS
```bash
# 1. Build
npm run build

# ERROS E CORREÇÕES:
Se erro "router is not defined"
  → import { useRouter } from 'next/navigation'
  → const router = useRouter()

Se erro 500 no fetch
  → Verifique se /api/auth/register/route.ts existe

Se erro "Email já cadastrado"
  → Esperado! Use outro email

# 2. Teste manual
npm run dev
# Acesse /cadastro
# Preencha com email NOVO
# Clique "Criar conta"
# VERIFICAR: NÃO deve aparecer alert()
# VERIFICAR: Deve redirecionar para /login
# VERIFICAR: npx prisma studio → novo usuário na tabela users
```

---

# 🔑 RECEITA 4: LOGIN FUNCIONAL

## PASSO#0: ESPECIFICAR EXATAMENTE
```
"Quero implementar [LOGIN COM NEXTAUTH CREDENTIALS] que faz [validar email/senha, criar sessão JWT, redirecionar para dashboard correto baseado na role] 
usando [NextAuth signIn() + CredentialsProvider] armazenando em [cookie httpOnly + JWT] 
com validações [email existe no banco, senha confere com hash bcrypt] 
e retornando [redirect para /dashboard (LAWYER) ou /cliente/dashboard (CLIENT)]"
```

## PASSO#2: ARQUIVOS EXPLÍCITOS

### Arquivo: `/app/login/page.tsx` (MODIFICAR)
```
Caminho: /app/login/page.tsx

ADICIONAR nos imports:
  - import { signIn } from 'next-auth/react'
  - import { useRouter, useSearchParams } from 'next/navigation'

ADICIONAR state:
  - const [error, setError] = useState('')

REMOVER do handleSubmit (linhas 25-27):
  - // TODO: Implementar autenticação
  - console.log('Login:', formData)
  - alert('Funcionalidade de login será implementada com NextAuth')

ADICIONAR no handleSubmit:
  const result = await signIn('credentials', {
    email: formData.email,
    password: formData.password,
    redirect: false,
  });

  if (result?.error) {
    setError(result.error);
  } else {
    router.push('/dashboard');
    router.refresh();
  }

ADICIONAR no JSX antes do form:
  {error && (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      {error}
    </div>
  )}
```

## PASSO#3: TESTES IMEDIATOS
```bash
# 1. Build
npm run build

# ERROS E CORREÇÕES:
Se erro "signIn is not a function"
  → import { signIn } from 'next-auth/react'

Se erro "router is not defined"
  → import { useRouter } from 'next/navigation'
  → const router = useRouter()

Se login retorna erro "Usuário não encontrado"
  → Cadastre um usuário primeiro

Se login retorna erro "Senha incorreta"
  → Verifique a senha, bcrypt é case-sensitive

# 2. Teste manual
npm run dev
# Primeiro cadastre via /cadastro
# Acesse /login
# Digite email e senha
# Clique "Entrar"
# VERIFICAR: NÃO deve aparecer alert()
# VERIFICAR: Deve redirecionar para /dashboard
# VERIFICAR: Console não deve ter erros
```

---

# 👤 RECEITA 5: DASHBOARD DO CLIENTE

## PASSO#0: ESPECIFICAR EXATAMENTE
```
"Quero implementar [DASHBOARD DO CLIENTE] que faz [mostrar casos enviados, status de cada caso, advogados que responderam, ações rápidas] 
usando [Next.js 14 + Prisma + getServerSession] armazenando em [PostgreSQL tabela cases, leads] 
com validações [usuário autenticado, role igual a CLIENT] 
e retornando [ClientDashboardData { cases: Case[], notifications: Notification[], savedLawyers: Lawyer[] }]"
```

## PASSO#2: ARQUIVOS EXPLÍCITOS

### Arquivo 1: `/app/cliente/dashboard/page.tsx` (CRIAR)
```
Caminho: /app/cliente/dashboard/page.tsx
Imports:
  - { useState, useEffect } from "react"
  - Link from "next/link"
  - { useSession } from "next-auth/react"
  - { useRouter } from "next/navigation"

Exports:
  - default ClientDashboardPage

Tipos:
  - ClientDashboardData: {
      cases: Array<{
        id: string;
        caseType: string;
        description: string;
        status: string;
        aiAnalysis?: string;
        createdAt: string;
      }>;
      savedLawyers: Array<{
        id: string;
        name: string;
        practiceAreas: string[];
        city: string;
      }>;
    }
```

### Arquivo 2: `/app/api/cliente/dashboard/route.ts` (CRIAR)
```
Caminho: /app/api/cliente/dashboard/route.ts
Imports:
  - { NextResponse } from "next/server"
  - { getServerSession } from "next-auth"
  - { authOptions } from "@/lib/auth"
  - { prisma } from "@/lib/prisma"

Exports:
  - GET: () => Promise<NextResponse>

Lógica:
  1. Verificar sessão
  2. Buscar cases do usuário: prisma.case.findMany({ where: { email: session.user.email } })
  3. Retornar dados
```

## PASSO#3: TESTES IMEDIATOS
```bash
# 1. Criar pasta
mkdir -p app/cliente/dashboard
mkdir -p app/api/cliente/dashboard

# 2. Build
npm run build

# ERROS E CORREÇÕES:
Se erro "Cannot find module"
  → Verifique se criou os arquivos corretamente

Se 404 ao acessar /cliente/dashboard
  → Verifique se page.tsx está no lugar certo

# 3. Teste manual
npm run dev
# Login como CLIENT
# Acesse /cliente/dashboard
# VERIFICAR: Deve mostrar casos do usuário logado
```

---

# 📄 RECEITA 6: PERFIL PÚBLICO DO ADVOGADO

## PASSO#0: ESPECIFICAR EXATAMENTE
```
"Quero implementar [PÁGINA PÚBLICA DE PERFIL DO ADVOGADO] que faz [mostrar informações do advogado, áreas de atuação, avaliações, formulário de contato] 
usando [Next.js 14 Dynamic Routes + Prisma + SEO metadata] armazenando em [leads quando alguém entra em contato] 
com validações [slug existe no banco, advogado está ativo] 
e retornando [página SSR com metadata para SEO]"
```

## PASSO#2: ARQUIVOS EXPLÍCITOS

### Arquivo: `/app/advogado/[slug]/page.tsx` (CRIAR)
```
Caminho: /app/advogado/[slug]/page.tsx
Imports:
  - { Metadata } from "next"
  - { notFound } from "next/navigation"
  - { prisma } from "@/lib/prisma"
  - Link from "next/link"

Exports:
  - generateMetadata: ({ params }) => Promise<Metadata>
  - default LawyerProfilePage

Tipos:
  - LawyerProfile: {
      id: string;
      user: { name: string; email: string; phone?: string; photo?: string; bio?: string; verified: boolean; plan: string };
      practiceAreas: Array<{ practiceArea: { name: string; slug: string } }>;
      reviews: Array<{ rating: number; comment: string; reviewerName: string; createdAt: string }>;
      city?: string;
      state?: string;
      oabNumber?: string;
      barAdmission?: string;
    }

Lógica:
  1. Buscar advogado por slug: prisma.lawyerProfile.findFirst({ where: { user: { email: { contains: slug } } } })
  2. Se não encontrar: notFound()
  3. Renderizar página com informações
  4. Formulário de contato que salva lead
```

## PASSO#3: TESTES IMEDIATOS
```bash
# 1. Criar pasta
mkdir -p app/advogado/\[slug\]

# 2. Build
npm run build

# ERROS E CORREÇÕES:
Se erro "slug is undefined"
  → Verifique params.slug na função

Se erro 404
  → Verifique se advogado existe no banco

# 3. Teste manual
npm run dev
# Cadastre um advogado primeiro
# Acesse /advogado/email-do-advogado
# VERIFICAR: Deve mostrar informações do advogado
```

---

# 💳 RECEITA 7: STRIPE PAGAMENTOS

## PASSO#0: ESPECIFICAR EXATAMENTE
```
"Quero implementar [PAGAMENTO VIA STRIPE CHECKOUT] que faz [criar checkout session, processar pagamento, atualizar plano do usuário via webhook] 
usando [Stripe SDK + Checkout Sessions + Webhooks] armazenando em [tabela subscriptions + atualizar users.plan] 
com validações [usuário autenticado, plano válido, assinatura ativa] 
e retornando [redirect para Stripe Checkout, depois redirect para success/cancel page]"
```

## PASSO#2: ARQUIVOS EXPLÍCITOS

### Arquivo 1: `/app/api/stripe/create-checkout/route.ts` (CRIAR)
```
Caminho: /app/api/stripe/create-checkout/route.ts
Imports:
  - { NextRequest, NextResponse } from "next/server"
  - { getServerSession } from "next-auth"
  - { authOptions } from "@/lib/auth"
  - { stripe } from "@/lib/stripe"
  - { PLANS } from "@/lib/plans"

Exports:
  - POST: (request: NextRequest) => Promise<NextResponse>

Lógica:
  1. Verificar sessão
  2. Pegar plano do body
  3. Criar checkout session:
     stripe.checkout.sessions.create({
       mode: 'subscription',
       payment_method_types: ['card'],
       line_items: [{ price: PLANS[plan].priceId, quantity: 1 }],
       success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
       cancel_url: `${process.env.NEXTAUTH_URL}/para-advogados?canceled=true`,
       client_reference_id: session.user.id,
       metadata: { plan }
     })
  4. Retornar { url: checkoutSession.url }
```

### Arquivo 2: `/lib/plans.ts` (MODIFICAR)
```
MODIFICAR:
  - PREMIUM.priceId: process.env.STRIPE_PRICE_PREMIUM
  - FEATURED.priceId: process.env.STRIPE_PRICE_FEATURED
  
REMOVER:
  - stripePriceId: 'price_1Oxxxx' (placeholders)
```

## PASSO#3: TESTES IMEDIATOS
```bash
# 1. Configurar Stripe
# No Stripe Dashboard:
# - Criar produto "Premium" com preço $199/mês
# - Criar produto "Destaque" com preço $399/mês
# - Copiar os price_ids

# 2. Adicionar ao .env.local
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_PREMIUM=price_...
STRIPE_PRICE_FEATURED=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# 3. Build
npm run build

# ERROS E CORREÇÕES:
Se erro "Stripe is not defined"
  → npm install stripe

Se erro "Invalid price ID"
  → Verifique se copiou o price_id correto do Stripe

# 4. Teste
npm run dev
# Login como advogado
# Acesse /para-advogados
# Clique em "Fazer Upgrade"
# VERIFICAR: Deve abrir Stripe Checkout
```

---

# 📧 RECEITA 8: EMAILS COM RESEND

## PASSO#0: ESPECIFICAR EXATAMENTE
```
"Quero implementar [SISTEMA DE EMAILS TRANSACIONAIS] que faz [enviar email de boas-vindas, notificar advogado de novo lead, confirmação de pagamento] 
usando [Resend SDK + React Email templates] armazenando em [logs no banco opcionalmente] 
com validações [email válido, template existe] 
e retornando [{ success: true, messageId: string }]"
```

## PASSO#2: ARQUIVOS EXPLÍCITOS

### Arquivo 1: `/lib/email.ts` (CRIAR)
```
Caminho: /lib/email.ts
Imports:
  - { Resend } from "resend"

Exports:
  - sendWelcomeEmail: (to: string, name: string) => Promise<void>
  - sendNewLeadEmail: (lawyerEmail: string, leadData: LeadData) => Promise<void>
  - sendPaymentConfirmation: (to: string, plan: string) => Promise<void>

Config:
  const resend = new Resend(process.env.RESEND_API_KEY);
```

## PASSO#3: TESTES IMEDIATOS
```bash
# 1. Configurar Resend
# Acesse resend.com
# Crie conta e copie API key

# 2. Adicionar ao .env.local
RESEND_API_KEY=re_...

# 3. Testar
npm run dev
# Cadastre novo usuário
# VERIFICAR: Email de boas-vindas deve chegar
```

---

# 🌐 RECEITA 9: MULTI-IDIOMA REAL

## PASSO#0: ESPECIFICAR EXATAMENTE
```
"Quero implementar [SISTEMA DE MULTI-IDIOMA] que faz [trocar idioma da interface, persistir preferência, traduzir todas as strings] 
usando [next-intl + Context API + cookies] armazenando em [cookie de preferência] 
com validações [locale válido (pt|en|es)] 
e retornando [interface no idioma selecionado]"
```

## PASSO#2: ARQUIVOS EXPLÍCITOS

### Arquivo 1: `/lib/i18n-provider.tsx` (CRIAR)
```
Caminho: /lib/i18n-provider.tsx
Imports:
  - { createContext, useContext, useState, useEffect } from "react"
  - { translations } from "./i18n"

Exports:
  - I18nProvider: React.FC<{ children: React.ReactNode }>
  - useTranslation: () => { t: (key: string) => string, locale: string, setLocale: (l: string) => void }
```

### Arquivo 2: Todas as páginas
```
MODIFICAR cada página:
  - import { useTranslation } from "@/lib/i18n-provider"
  - const { t } = useTranslation()
  - Trocar strings hardcoded por t('chave')
```

## PASSO#3: TESTES IMEDIATOS
```bash
npm run build
npm run dev
# Trocar idioma no seletor
# VERIFICAR: Toda a interface deve mudar
```

---

# ✅ CHECKLIST FINAL PARA WINDSURF

```
[ ] RECEITA 1: Autenticação
    [ ] npm install next-auth @auth/prisma-adapter bcryptjs
    [ ] Criar /lib/auth.ts
    [ ] Criar /app/api/auth/[...nextauth]/route.ts
    [ ] Criar /app/api/auth/register/route.ts
    [ ] Criar /middleware.ts
    [ ] Atualizar prisma schema
    [ ] npm run build - 0 erros

[ ] RECEITA 2: Dashboard Real
    [ ] Remover mockData de /app/dashboard/page.tsx
    [ ] Atualizar /app/api/dashboard/route.ts
    [ ] npm run build - 0 erros

[ ] RECEITA 3: Cadastro Funcional
    [ ] Remover alert() de /app/cadastro/page.tsx
    [ ] Adicionar fetch para /api/auth/register
    [ ] npm run build - 0 erros

[ ] RECEITA 4: Login Funcional
    [ ] Remover alert() de /app/login/page.tsx
    [ ] Adicionar signIn() do NextAuth
    [ ] npm run build - 0 erros

[ ] RECEITA 5: Dashboard Cliente
    [ ] Criar /app/cliente/dashboard/page.tsx
    [ ] Criar /app/api/cliente/dashboard/route.ts
    [ ] npm run build - 0 erros

[ ] RECEITA 6: Perfil Advogado
    [ ] Criar /app/advogado/[slug]/page.tsx
    [ ] npm run build - 0 erros

[ ] RECEITA 7: Stripe
    [ ] Configurar produtos no Stripe Dashboard
    [ ] Atualizar .env com price_ids reais
    [ ] Criar /app/api/stripe/create-checkout/route.ts
    [ ] npm run build - 0 erros

[ ] RECEITA 8: Emails
    [ ] Criar /lib/email.ts
    [ ] Adicionar RESEND_API_KEY ao .env
    [ ] npm run build - 0 erros

[ ] RECEITA 9: Multi-idioma
    [ ] Criar /lib/i18n-provider.tsx
    [ ] Atualizar todas as páginas com t()
    [ ] npm run build - 0 erros
```

---

**Documento criado:** 03/01/2026
**Versão:** 1.0
**Para uso com:** Windsurf Cascade
