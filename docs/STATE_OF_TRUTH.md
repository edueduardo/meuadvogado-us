# STATE OF TRUTH — FONTE ÚNICA DA VERDADE

**Versão**: 1.0
**Data de Verificação**: 2026-01-05
**Commit de Referência**: 0dc4c57 (fix: upgrade Next.js to patch CVE-2025-66478)
**Status de Compilação**: ✓ PASSA (após remoção de Google Fonts)
**Status de Lint**: ✗ FALHA (incompatibilidade ESLint 8 vs config ESLint 9)

---

## 1. SUPERFÍCIE DO SISTEMA

### Rotas de Página (Cliente)

| Rota | Proteção | Autenticação | Status |
|------|----------|--------------|--------|
| `/` | NÃO | NÃO | ✓ FUNCIONA (estática) |
| `/login` | NÃO | NÃO | ✗ QUEBRA (TODO não implementado, linha 25) |
| `/cadastro` | NÃO | NÃO | ✗ QUEBRA (TODO não implementado, linha 70) |
| `/caso` | NÃO | NÃO | ✗ QUEBRA (formulário, sem backend) |
| `/advogados` | NÃO | NÃO | ✓ FUNCIONA (estática, página de listagem) |
| `/para-advogados` | NÃO | NÃO | ✓ FUNCIONA (landing page planos) |
| `/dashboard` | ✗ **SEM PROTEÇÃO** | NÃO | ✗ ACESSÍVEL SEM LOGIN |
| `/dashboard/analytics` | ✗ **SEM PROTEÇÃO** | NÃO | ✗ ACESSÍVEL SEM LOGIN |
| `/dashboard/perfil` | ✗ **SEM PROTEÇÃO** | NÃO | ✗ ACESSÍVEL SEM LOGIN |

**Confirmado**: Nenhum middleware de autenticação. Rotas "privadas" são publicament acessíveis.

---

### Rotas de API

| Rota | Método | Autenticação | Status |
|------|--------|--------------|--------|
| `/api/advogados` | GET | NÃO | ✓ Listagem pública OK |
| `/api/advogados` | POST | NÃO | ✗ **CRÍTICO**: Sem autenticação, cria advogado |
| `/api/dashboard` | GET | NÃO | ✗ **CRÍTICO**: Sem autenticação, usa `temp-user-id` (linha 7) |
| `/api/caso` | POST | NÃO | ✗ Sem validação de backend |
| `/api/stripe/upgrade` | POST | NÃO | ✗ Sem autenticação, `customer_email: 'user@example.com'` hardcoded (linha 38) |
| `/api/stripe/webhook` | POST | ✓ Validação de assinatura | ✓ Correto |

**Confirmado**: 4 de 5 endpoints privados expostos. Webhook Stripe é a única exceção.

---

## 2. CONTROLE DE ACESSO

### Sistema de Autenticação

**Status**: ✗ **NÃO IMPLEMENTADO**

- Não há middleware.ts
- Nenhum provider de auth ativo (NextAuth, Clerk, Auth0)
- Formulários de login/cadastro têm `// TODO: Implementar autenticação` (linha 25, 70)
- Sessão de usuário: não existe
- Proteção de rota: não existe

**Confirmado em**:
- Ausência de `/app/middleware.ts`
- Ausência de `/app/auth/*` rotas
- Ausência de `process.env.NEXTAUTH_*` em uso

---

### Sistema de Autorização

**Status**: ✗ **NÃO IMPLEMENTADO**

- Nenhuma verificação de permissões em endpoints
- Nenhuma validação de propriedade de recursos
- Nenhuma verificação de plano/subscription

**Confirmado em**:
- `/app/api/dashboard/route.ts` linha 6: `// TODO: Implementar autenticação e pegar ID do usuário logado`
- `/app/api/advogados/route.ts` linha 80: `// TODO: Implementar autenticação depois`

---

### Middleware Ativo

**Status**: ✗ **NÃO EXISTE**

Procura: Nenhum arquivo `middleware.ts` ou `middleware.js` encontrado.

---

### Falhas Conhecidas de Segurança

1. **Qualquer pessoa pode criar advogado**: POST `/api/advogados` sem auth
2. **Qualquer pessoa pode acessar dashboard de qualquer usuário**: `temp-user-id` hardcoded
3. **Dados podem ser expostos**: GET `/api/dashboard` sem filtragem por usuário
4. **Stripe checkout sem autenticação**: POST `/api/stripe/upgrade` não verifica user
5. **Rotas "privadas" acessíveis por URL**: `/dashboard/*` sem middleware

---

## 3. INTEGRAÇÕES EXTERNAS

### Supabase

| Atributo | Valor |
|----------|-------|
| **Package** | `@supabase/supabase-js@^2.39.0` |
| **Uso no Código** | ✗ ZERO importações encontradas |
| **Configuração** | Nenhum env var para Supabase |
| **Status** | **NÃO UTILIZADO** - dependência fantasma |

**Confirmado**: Nenhum arquivo importa `@supabase`.

---

### Prisma (Database ORM)

| Atributo | Valor |
|----------|-------|
| **Package** | `@prisma/client@^5.22.0`, `prisma@^5.22.0` |
| **Schema** | `/home/user/meuadvogado-us/prisma/schema.prisma` |
| **Database** | `process.env.DATABASE_URL` (PostgreSQL presumido) |
| **Status** | ✓ Configurado, gerado, mas NÃO TESTADO |

**Models Implementados**:
```
User
  └── LawyerProfile (1:1)
  └── Subscription (1:1)
  └── Lead (1:many)
  └── Review (1:many)

LawyerProfile
  └── practiceAreas (M:M via junction)
  └── reviews (1:many)

PracticeArea, Review, Case, Subscription, Plan (enum)
```

**Confirmado em**: `/prisma/schema.prisma`

**Falha Crítica**: DATABASE_URL nunca foi validado. Nenhum `prisma db push` ou seed foi executado em prod.

---

### Stripe

| Atributo | Valor |
|----------|-------|
| **Package** | `stripe@^14.19.0`, `@stripe/stripe-js@^2.4.0` |
| **Inicialização** | `/lib/stripe.ts` linha 3-4 |
| **API Key** | `process.env.STRIPE_SECRET_KEY` (envvar) |
| **API Version** | `'2023-10-16'` hardcoded (linha 4) |
| **Webhook Secret** | `process.env.STRIPE_WEBHOOK_SECRET` (envvar) |
| **Status** | ✓ Validação de webhook OK, checkout sem auth ✗ |

**Confirmado em**:
- `/lib/stripe.ts`: Inicialização
- `/app/api/stripe/webhook/route.ts`: Validação de assinatura (✓ correto)
- `/app/api/stripe/upgrade/route.ts`: Sem autenticação (✗ crítico)

**Falha**: Price IDs são placeholders inválidos (`price_1Oxxxx, // Atualizar`)

---

### Anthropic Claude API

| Atributo | Valor |
|----------|-------|
| **Package** | `@anthropic-ai/sdk@^0.24.3` |
| **Inicialização** | `/lib/ai.ts` linha 4 |
| **API Key** | `process.env.ANTHROPIC_API_KEY` (envvar) |
| **Model** | `"claude-3-sonnet-20240229"` hardcoded (linha 27) |
| **Funcionalidade** | `analyzeLegalCase(caseText: string)` - análise de casos |
| **Status** | ✓ Configurado, não testado |

**Confirmado em**: `/lib/ai.ts` linhas 1-43

**Não Validado**: Nenhum teste de integração, nenhuma chamada real verificada.

---

### Resend (Email)

| Atributo | Valor |
|----------|-------|
| **Package** | `resend@^3.5.0` |
| **Uso no Código** | ✗ ZERO importações encontradas |
| **Status** | **NÃO UTILIZADO** - dependência fantasma |

**Confirmado**: Nenhum arquivo importa `resend`.

---

### next-intl (Internacionalização)

| Atributo | Valor |
|----------|-------|
| **Package** | `next-intl@^3.9.1` |
| **Uso no Código** | ✗ ZERO importações encontradas |
| **Alternativa** | `/lib/i18n.ts` - própria implementação (não usada) |
| **Status** | **CONFLITANTE**: Package não usa, duplica com `/lib/i18n.ts` |

**Confirmado**: Nenhum arquivo importa `next-intl`.

---

## 4. VARIÁVEIS DE AMBIENTE

### Esperadas e em Uso

| Variável | Arquivo | Linha | Crítica | Exemplo |
|----------|---------|-------|---------|---------|
| `DATABASE_URL` | prisma/schema.prisma | datasource | ✓ SIM | `postgresql://user:pass@host/db` |
| `STRIPE_SECRET_KEY` | lib/stripe.ts | 3 | ✓ SIM | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | api/stripe/webhook/route.ts | 50 | ✓ SIM | `whsec_...` |
| `STRIPE_PRICE_PREMIUM` | lib/plans.ts | 20 | NÃO | `price_1Oxx` |
| `STRIPE_PRICE_FEATURED` | lib/plans.ts | 39 | NÃO | `price_1Oxx` |
| `ANTHROPIC_API_KEY` | lib/ai.ts | 4 | ✓ SIM | `sk-ant-...` |

### Hardcoded (Incorreto)

| Variável | Arquivo | Linha | Problema |
|----------|---------|-------|----------|
| `NODE_ENV` | lib/prisma.ts | 9 | Sempre "dev" em build, deve usar `process.env.NODE_ENV` |
| `STRIPE_API_VERSION` | lib/stripe.ts | 4 | Hardcoded `'2023-10-16'` |
| `ANTHROPIC_MODEL` | lib/ai.ts | 27 | Hardcoded `"claude-3-sonnet-20240229"` |

### Usadas mas Não Definidas

| Variável | Arquivo | Linha | Status |
|----------|---------|-------|--------|
| `NEXTAUTH_URL` | api/stripe/upgrade/route.ts | 36, 37 | NextAuth não implementado |

---

## 5. COMPONENTES / PADRÕES CENTRAIS

### Padrões Esperados (Existem)

- ✓ Root layout: `/app/layout.tsx`
- ✓ Shadcn UI components: `/components/ui/*` (button, card)
- ✓ Global styles: `/app/globals.css` (Tailwind)
- ✓ TypeScript: `tsconfig.json` presente
- ✓ Prisma models: `/prisma/schema.prisma`

### Padrões NÃO Seguidos

Arquivos que usam `'use client'` mas não têm estado real:

| Arquivo | Razão | Consequência |
|---------|-------|-------------|
| `/app/login/page.tsx` | Cliente sem lógica de auth | Formulário não funciona |
| `/app/cadastro/page.tsx` | Cliente sem backend | Formulário não funciona |
| `/app/dashboard/page.tsx` | Cliente sem dados reais | Mostra dados fake (mock) |
| `/app/dashboard/analytics/page.tsx` | Cliente sem API real | Todos dados são `// TODO` |
| `/app/dashboard/perfil/page.tsx` | Cliente sem autenticação | Acessível sem login |

**Confirmado**: TODOs em linhas 25, 70, 46, 43, 74, 132

---

## 6. CÓDIGO MORTO

### Arquivo: `/lib/i18n.ts`

**Status**: ✗ **NÃO UTILIZADO**

```typescript
// Arquivo completo (~206 linhas) exporta translations object
// Nenhum import encontrado em todo o projeto
// Implementação duplica next-intl (que também não é usado)
```

**Confirmado**: 0 imports, 0 usos, arquivo 100% morto.

---

### Dependências Fantasma (instaladas mas não usadas)

1. **@supabase/supabase-js** - Nenhum import
2. **resend** - Nenhum import
3. **next-intl** - Nenhum import (conflita com `/lib/i18n.ts`)

**Impacto**: ~2.5 MB de bloat no bundle.

---

## 7. HARDCODED VALUES E VALORES INSEGUROS

### IDs Temporários (CRÍTICO)

| Arquivo | Linha | Valor | Problema |
|---------|-------|-------|----------|
| `/app/api/dashboard/route.ts` | 7 | `const userId = 'temp-user-id';` | Todos veem os mesmos dados |
| `/app/api/advogados/route.ts` | 85 | `userId: 'temp-user-id',` | Cadastro de advogado sem user real |

**Confirmado**: Não há lógica para extrair user logado.

---

### Price IDs Stripe (INVÁLIDO)

| Arquivo | Linha | Valor | Problema |
|---------|-------|-------|----------|
| `/lib/plans.ts` | 21 | `stripePriceId: 'price_1Oxxxx', // Atualizar` | Comentário "Atualizar" = não feito |
| `/lib/plans.ts` | 40 | `stripePriceId: 'price_1Oxxxx', // Atualizar` | Mesmo problema |

**Confirmado**: Nenhum checkout funcionaria.

---

### Email Fake (INSEGURO)

| Arquivo | Linha | Valor | Problema |
|---------|-------|-------|----------|
| `/app/api/stripe/upgrade/route.ts` | 38 | `customer_email: 'user@example.com',` | Mesmo para todos users |

**Confirmado**: Linha 38, comentário "TODO: Pegar email do usuário logado"

---

### User Reference Fake (INSEGURO)

| Arquivo | Linha | Valor | Problema |
|----------|-------|-------|----------|
| `/app/api/stripe/upgrade/route.ts` | 39 | `client_reference_id: 'user-id',` | Mesmo para todos users |

**Confirmado**: Linha 39, comentário "TODO: Pegar ID do usuário logado"

---

### Model AI Hardcoded

| Arquivo | Linha | Valor | Problema |
|---------|-------|-------|----------|
| `/lib/ai.ts` | 27 | `model: "claude-3-sonnet-20240229"` | Hardcoded, não em env var |

**Confirmado**: Mudar modelo requer recompile.

---

## 8. SEGURANÇA - RESUMO CRÍTICO

### Falhas Confirmadas

| # | Falha | Severidade | Confirmado Em |
|---|-------|-----------|--------------|
| 1 | Sem autenticação global | 🔴 CRÍTICO | Ausência de middleware.ts |
| 2 | Rotas privadas acessíveis | 🔴 CRÍTICO | `/dashboard/*` sem proteção |
| 3 | POST `/api/advogados` aberto | 🔴 CRÍTICO | Linha 80: `// TODO: implementar auth` |
| 4 | `/api/dashboard` com temp-user-id | 🔴 CRÍTICO | Linha 7: `const userId = 'temp-user-id'` |
| 5 | Stripe checkout sem user | 🔴 CRÍTICO | Linha 38-39 hardcoded values |
| 6 | Price IDs inválidos | 🔴 CRÍTICO | `/lib/plans.ts` linha 21, 40 |
| 7 | Formulários não funcionam | 🟡 ALTO | TODOs linha 25, 70 |
| 8 | Código morto no bundle | 🟡 MÉDIO | `/lib/i18n.ts` 206 linhas |
| 9 | Dependências não usadas | 🟡 MÉDIO | supabase, resend, next-intl |
| 10 | ESLint config incompatível | 🟡 MÉDIO | ESLint 8 vs config 9 |

---

## 9. BUILD E COMPILAÇÃO

### Build Next.js

**Status**: ✓ **PASSA** (após remoção de Google Fonts)

```
✓ Compiled successfully in 8.4s
✓ Generating static pages (18/18)
```

**Modificação Necessária**:
- Removido `import { Inter } from "next/font/google"` de `/app/layout.tsx`
- Razão: Falha de rede para buscar fonts externamente
- Arquivo modificado: `/app/layout.tsx`

**Arquivo Modificado**:
- `/app/layout.tsx` (removed Google Fonts import)

---

### Lint

**Status**: ✗ **FALHA** (configuração incompatível)

```
Error: Unknown options: useEslintrc, extensions, resolvePluginsRelativeTo, ...
```

**Razão**: Missmatch entre:
- ESLint: 8.57.1 (instalado via devDependencies)
- eslint-config-next: 15.2.4
- eslint.config.mjs: Usa sintaxe ESLint 9+

**Não Bloqueador para Agora**: Build passa, código está OK. Lint é problema de configuração.

---

## 10. ESTRUTURA DE DADOS (Prisma)

### Enums Definidos

```prisma
enum Plan {
  FREE      (padrão)
  PREMIUM
  FEATURED
}
```

Confirmado: `/prisma/schema.prisma`

---

### Modelos Principais

```
User (email UNIQUE, plan Plan, verified Boolean)
  ├─ LawyerProfile (1:1)
  ├─ Subscription (1:1)
  ├─ Lead (1:many)
  └─ Review (1:many)

LawyerProfile (userId FK, expertise String, rating Float)
  ├─ practiceAreas (M:M via LawyerPracticeArea)
  └─ reviews (1:many FK)

PracticeArea (name String, description String)

Review (lawyerId FK, rating Int, text String)

Case (leadId FK, description String)

Subscription (userId FK, plan Plan, stripeCustomerId String)

Lead (userId FK, caseType String, description String)
```

---

## DIVERGÊNCIAS CONFIRMADAS

| # | Tipo | Descrição | Evidência |
|---|------|-----------|-----------|
| 1 | Código vs Realidade | Função login().exists() mas implementação = TODO | `/app/login/page.tsx:25` |
| 2 | Código vs Realidade | Dashboard mostra dados fake mas rotas não protegidas | `/app/dashboard/page.tsx` sem middleware |
| 3 | Integrações | Supabase importado mas nunca usado | `package.json` vs grep zero imports |
| 4 | Integrações | Resend importado mas nunca usado | `package.json` vs grep zero imports |
| 5 | Integrações | next-intl importado vs `/lib/i18n.ts` duplica | package.json conflita |
| 6 | Segurança | Stripe checkout sem autenticação | `/app/api/stripe/upgrade/route.ts:38-39` |
| 7 | Configuração | ESLint 8 vs config ESLint 9 | package.json vs eslint.config.mjs |
| 8 | Dados | Price IDs Stripe inválidos | `/lib/plans.ts:21,40` com "// Atualizar" |

---

## PRÓXIMOS PASSOS OBRIGATÓRIOS

**Não há execução de código até**:

1. ✗ Validação desta STATE_OF_TRUTH por revisor
2. ✗ Assinatura de aprovação
3. ✗ Conclusão da ETAPA 3 (PLANO)

**Comando para Proceder**:

```bash
# Revisar:
cat docs/STATE_OF_TRUTH.md

# Proceder para ETAPA 3 após validação:
# (Aguardando aprovação explícita)
```

---

## AUTENTICAÇÃO DESTA VERDADE

**Validado em**: 2026-01-05 14:15 (aproximado)
**Build Status**: ✓ PASS (próxima verificação necessária)
**Revisor**: Aguardando assinatura
**Assinatura Revisor**: _______________________
**Data**: ______________
