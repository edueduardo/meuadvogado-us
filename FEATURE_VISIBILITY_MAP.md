# 🗺️ FEATURE VISIBILITY MAP - Onde Estão as Features

## 📊 Status de Visibilidade

### 🤖 AI Legal Copilot 24/7
- **Status:** ✅ VISÍVEL
- **Onde:** Floating button no canto inferior direito (bottom-right)
- **URLs acessíveis:**
  - `https://meuadvogado-us.vercel.app/` (Homepage)
  - `https://meuadvogado-us.vercel.app/cliente` (Página Cliente)
  - `https://meuadvogado-us.vercel.app/advogado` (Página Advogado)
- **Quem vê:** TODOS (público + autenticado)
- **Como acessar:** Clique no botão flutuante de chat
- **Componente:** `components/LegalCopilot.tsx`
- **Implementado em:** `app/page.tsx:177`

---

### 🔮 Quiz "Qual Minha Chance?"
- **Status:** ⚠️ EXISTE MAS PRECISA LINK
- **Onde:** `/quiz` (página dedicada)
- **URL:** `https://meuadvogado-us.vercel.app/quiz`
- **Quem vê:** TODOS (visitantes desconectados)
- **Como acessar:**
  - ❌ Não está linkado da homepage
  - ❌ Não está linkado das páginas /cliente, /advogado
  - ✅ URL direta funciona
- **Componente:** `components/CaseSuccessQuiz.tsx`
- **Página:** `app/quiz/page.tsx`
- **PROBLEMA:** Visitantes não sabem que existe!

---

### 📍 Live Case Tracker
- **Status:** ✅ VISÍVEL
- **Onde:** `/cliente/dashboard`
- **URL:** `https://meuadvogado-us.vercel.app/cliente/dashboard`
- **Quem vê:** CLIENTES autenticados
- **Como acessar:**
  1. Faça login em `/login`
  2. Vá para `/cliente/dashboard`
  3. Veja "Acompanhamento de Caso" no topo
- **Componente:** `components/CaseTracker.tsx`
- **Integrado em:** `app/cliente/dashboard/page.tsx`

---

### 🎓 Academy for Lawyers
- **Status:** ✅ VISÍVEL
- **Onde:** `/advogado/academy`
- **URL:** `https://meuadvogado-us.vercel.app/advogado/academy`
- **Quem vê:** ADVOGADOS autenticados
- **Como acessar:**
  1. Faça login como advogado
  2. Vá para `/advogado/dashboard`
  3. Clique no card "Aprenda e Venda Mais"
- **Conteúdo:** 4 vídeos educativos com roteiros
- **Videos:**
  - "O Segredo do Perfil Campeão"
  - "A Arte de Converter Leads"
  - "Entendendo o Matching com IA"
  - "Features do Plano Enterprise"
- **Componente:** `app/advogado/academy/page.tsx`

---

### 📘 Client Guide (Guia do Cliente)
- **Status:** ✅ VISÍVEL
- **Onde:** `/cliente/guia`
- **URL:** `https://meuadvogado-us.vercel.app/cliente/guia`
- **Quem vê:** CLIENTES autenticados + visitantes
- **Como acessar:**
  1. Ir para `/cliente/guia` (público)
  2. OU dentro do dashboard do cliente
- **Conteúdo:** 4 vídeos educativos com roteiros
- **Tópicos:**
  - "Você Não Está Sozinho" (Acolhimento)
  - "O Sigilo é Sagrado" (Privacidade)
  - "Cuidado com Golpes" (Segurança)
  - "Como Se Preparar" (Prático)
- **Componente:** `app/cliente/guia/page.tsx`

---

### 💳 Stripe Payments
- **Status:** ⚠️ CÓDIGO PRONTO, AGUARDA API KEY
- **Onde:** `/advogado/planos` + endpoints
- **URL:** `https://meuadvogado-us.vercel.app/advogado/planos`
- **API Endpoints:**
  - `POST /api/stripe/checkout` - Criar sessão de checkout
  - `POST /api/stripe/subscribe` - Criar assinatura
  - `POST /api/stripe/portal` - Portal do cliente
  - `POST /api/stripe/webhooks` - Receber eventos
- **Status Visual:** Botão "Assinar" existe mas não funciona (precisa STRIPE_SECRET_KEY)
- **Serviço:** `lib/stripe/stripe-service.ts`

---

### 📧 Email (Resend)
- **Status:** ⚠️ CÓDIGO PRONTO, AGUARDA API KEY
- **Onde:** Enviado automaticamente em eventos
- **Eventos:** Welcome, Password Reset, Case Notification, Payment
- **Templates:**
  - `lib/email/templates/welcome.ts`
  - `lib/email/templates/case-notification.ts`
  - `lib/email/templates/payment.ts`
  - `lib/email/templates/base-template.ts`
- **Status Visual:** Não há interface (automático)
- **Precisa:** RESEND_API_KEY

---

### 🤖 AI Matching (Claude)
- **Status:** ⚠️ CÓDIGO PRONTO, AGUARDA API KEY
- **Onde:** Endpoints `/api/ai/match` e `/api/ai/analyze-case`
- **Quem vê:** Sistema interno (automático)
- **Endpoints:**
  - `POST /api/ai/match` - Fazer matching de caso com advogados
  - `POST /api/ai/analyze-case` - Analisar caso com Claude
- **Status Visual:** Sem UI (funciona no backend)
- **Serviço:** `lib/ai/claude-service.ts`
- **Precisa:** ANTHROPIC_API_KEY

---

### ✅ Verificação BAR USA
- **Status:** ✅ IMPLEMENTADO
- **Onde:** Processo de onboarding do advogado
- **Funcionalidade:**
  - Valida licença de 50 estados americanos
  - Rejeita advogados sem BAR USA
  - Aceita OAB/outros como "OPCIONAL" (apenas informativo)
- **Serviço:** `lib/verification/bar-verification.ts`
- **Endpoint:** `POST /api/lawyers/verify`
- **Status Visual:** Badge "Verificado" aparece no perfil do advogado

---

### 📊 Analytics (Mixpanel)
- **Status:** ⚠️ CÓDIGO PRONTO, AGUARDA API KEY
- **Onde:** Integrado em toda a app
- **Eventos rastreados:**
  - Signup
  - Case submission
  - Lead acceptance
  - Payment completion
  - Profile update
- **Serviço:** `lib/analytics/analytics-service.ts`
- **Provider:** `components/AnalyticsProvider.tsx`
- **Status Visual:** Dashboard em `lib/analytics/` (não buildado ainda)
- **Precisa:** NEXT_PUBLIC_MIXPANEL_TOKEN

---

### 🎯 Onboarding Wizard
- **Status:** ✅ IMPLEMENTADO
- **Onde:** `/onboarding/advogado`
- **URL:** `https://meuadvogado-us.vercel.app/onboarding/advogado`
- **Quem vê:** Novos advogados
- **Conteúdo:** 5 steps de onboarding
- **Status Visual:** Página funcional
- **Componente:** `app/onboarding/advogado/page.tsx`

---

### 🔐 Feature Gating
- **Status:** ✅ IMPLEMENTADO
- **Onde:** Sistema global
- **Por Plano:**
  - **Starter (Grátis):** 3 leads/mês, chat básico
  - **Professional ($199):** Unlimited leads, analytics, templates
  - **Enterprise ($499):** API access, dedicated manager
- **Serviço:** `lib/features/feature-flags.ts`
- **Hook:** `hooks/useFeature.ts` (não implementado ainda)
- **Status Visual:** Sem UI visível (controle backend)

---

## 🚨 O QUE ESTÁ FALTANDO PARA MÁXIMA VISIBILIDADE:

### **CRÍTICO - Fazer AGORA:**
1. ✅ Copilot - OK (já visível)
2. ❌ Quiz - **PRECISA DE LINK** na homepage
3. ✅ Case Tracker - OK (já no dashboard)
4. ✅ Academy - OK (já no dashboard)
5. ✅ Client Guide - OK (acessível)

### **IMPORTANTE - Próximas 48h:**
- [ ] Adicionar link "Quiz: Qual sua chance?" na homepage
- [ ] Adicionar link "Guia do Cliente" na página `/cliente`
- [ ] Criar Admin Dashboard para ver métricas
- [ ] Ativar suas API Keys (Stripe, Email, AI)

### **INTERFACE PRECISA SER:**
```
Homepage (/)
├── [Copilot] ✅
├── [Quiz "Qual minha chance?"] ❌ (PRECISA LINK)
├── Link → /cliente
├── Link → /advogado
└── Link → /cliente/guia

/cliente (Frontpage)
├── Conteúdo ✅
├── CTA: "Conte seu Caso"
├── Link → /quiz ❌ (PRECISA)
└── Link → /cliente/guia ✅

/advogado (Frontpage)
├── Conteúdo ✅
├── CTA: "Comece a Receber Leads"
├── Link → /onboarding/advogado
└── Link → /advogado/academy

/cliente/dashboard (Cliente autenticado)
├── Case Tracker ✅
├── Link → /cliente/guia ✅
└── Stats

/advogado/dashboard (Advogado autenticado)
├── Academy card ✅
├── Leads
├── Analytics
└── Perfil
```

---

## ✅ RESUMO VISUAL:

| Feature | Código | Visível | Funcional | Link | API Key |
|---------|--------|---------|-----------|------|---------|
| Copilot | ✅ | ✅ | ✅ | ✅ | ⏳ (Anthropic) |
| Quiz | ✅ | ⚠️ | ✅ | ❌ | ✅ (não precisa) |
| Case Tracker | ✅ | ✅ | ✅ | ✅ | ✅ (não precisa) |
| Academy | ✅ | ✅ | ✅ | ✅ | ✅ (não precisa) |
| Client Guide | ✅ | ✅ | ✅ | ✅ | ✅ (não precisa) |
| Stripe | ✅ | ⚠️ | ❌ | ❌ | ❌ STRIPE_SECRET_KEY |
| Email | ✅ | ⏳ | ❌ | ⏳ | ❌ RESEND_API_KEY |
| AI Matching | ✅ | ⏳ | ❌ | ⏳ | ❌ ANTHROPIC_API_KEY |
| Analytics | ✅ | ⏳ | ❌ | ⏳ | ❌ MIXPANEL_TOKEN |
| Verification | ✅ | ✅ | ✅ | ✅ | ✅ (não precisa) |
| Onboarding | ✅ | ✅ | ✅ | ✅ | ✅ (não precisa) |
| Feature Gating | ✅ | ⏳ | ⚠️ | ⏳ | ✅ (não precisa) |

---

## 🎯 PRÓXIMAS AÇÕES:

### **HOJE - Visibilidade (30 min):**
```bash
1. Adicionar link "Teste seu caso" → /quiz na homepage
2. Adicionar link "Guia Completo" → /cliente/guia na /cliente
3. Testar navegação de todas as features
```

### **AMANHÃ - Admin Dashboard (2 horas):**
```bash
1. Criar /admin/dashboard
2. Mostrar: Advogados, Clientes, Casos, Conversões
3. Métricas reais (não mock)
```

### **DEPOIS - API Keys (quando você tiver):**
```bash
1. STRIPE_SECRET_KEY → Ativar pagamentos
2. RESEND_API_KEY → Ativar emails reais
3. ANTHROPIC_API_KEY → Ativar AI matching
4. MIXPANEL_TOKEN → Ativar analytics
```

---

**PERGUNTA PARA VOCÊ:** Quer que eu adicione os LINKS das features que faltam agora mesmo? (5 min de trabalho)
