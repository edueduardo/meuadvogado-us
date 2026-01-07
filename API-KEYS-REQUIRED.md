# 🔑 API KEYS NECESSÁRIAS - Meu Advogado

Este documento lista todas as API keys necessárias para o funcionamento completo do sistema.

---

## 📋 RESUMO RÁPIDO

| Serviço | Variável | Obrigatório | Onde Criar |
|---------|----------|-------------|------------|
| Stripe | `STRIPE_SECRET_KEY` | ✅ Sim | [Stripe Dashboard](https://dashboard.stripe.com) |
| Stripe | `STRIPE_WEBHOOK_SECRET` | ✅ Sim | Stripe → Webhooks |
| Stripe | `STRIPE_PRICE_PROFESSIONAL` | ✅ Sim | Stripe → Products |
| Stripe | `STRIPE_PRICE_ENTERPRISE` | ✅ Sim | Stripe → Products |
| Resend | `RESEND_API_KEY` | ✅ Sim | [Resend](https://resend.com) |
| Anthropic | `ANTHROPIC_API_KEY` | ⚠️ Recomendado | [Anthropic Console](https://console.anthropic.com) |
| Mixpanel | `NEXT_PUBLIC_MIXPANEL_TOKEN` | ⚠️ Recomendado | [Mixpanel](https://mixpanel.com) |
| Redis | `UPSTASH_REDIS_REST_URL` | ⚡ Opcional | [Upstash](https://upstash.com) |
| Redis | `UPSTASH_REDIS_REST_TOKEN` | ⚡ Opcional | Upstash Dashboard |

---

## 1. 💳 STRIPE (Pagamentos)

### Como criar:
1. Acesse [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Crie uma conta ou faça login
3. Vá em **Developers → API Keys**
4. Copie a **Secret Key** (começa com `sk_`)

### Criar produtos/preços:
1. Vá em **Products → Add product**
2. Crie produto "Professional Plan" - $199/mês (recurring)
3. Crie produto "Enterprise Plan" - $499/mês (recurring)
4. Copie os Price IDs (começam com `price_`)

### Configurar webhook:
1. Vá em **Developers → Webhooks**
2. Clique **Add endpoint**
3. URL: `https://seu-dominio.com/api/stripe/webhooks`
4. Eventos: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`
5. Copie o **Signing secret** (começa com `whsec_`)

### Variáveis:
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PROFESSIONAL=price_...
STRIPE_PRICE_ENTERPRISE=price_...
```

---

## 2. 📧 RESEND (Emails)

### Como criar:
1. Acesse [https://resend.com](https://resend.com)
2. Crie uma conta
3. Vá em **API Keys → Create API Key**
4. Copie a key (começa com `re_`)

### Configurar domínio (recomendado):
1. Vá em **Domains → Add domain**
2. Adicione seu domínio (ex: meuadvogado.us)
3. Configure os registros DNS

### Variáveis:
```env
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@meuadvogado.us
```

---

## 3. 🤖 ANTHROPIC (Claude AI)

### Como criar:
1. Acesse [https://console.anthropic.com](https://console.anthropic.com)
2. Crie uma conta
3. Vá em **API Keys → Create Key**
4. Copie a key (começa com `sk-ant-`)

### Variáveis:
```env
ANTHROPIC_API_KEY=sk-ant-...
```

### Nota:
- Sem esta key, o sistema usa matching básico (funciona, mas menos preciso)
- Modelo usado: `claude-3-sonnet-20240229`

---

## 4. 📊 MIXPANEL (Analytics)

### Como criar:
1. Acesse [https://mixpanel.com](https://mixpanel.com)
2. Crie uma conta e projeto
3. Vá em **Settings → Project Settings**
4. Copie o **Project Token**

### Variáveis:
```env
NEXT_PUBLIC_MIXPANEL_TOKEN=...
```

### Nota:
- Sem esta key, eventos são logados apenas no console
- Útil para entender comportamento dos usuários

---

## 5. ⚡ UPSTASH REDIS (Cache/Rate Limiting)

### Como criar:
1. Acesse [https://upstash.com](https://upstash.com)
2. Crie uma conta
3. Crie um novo database Redis
4. Copie **REST URL** e **REST Token**

### Variáveis:
```env
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

### Nota:
- Sem esta key, sistema usa cache em memória (funciona para dev)
- Recomendado para produção com alto tráfego

---

## 📁 ARQUIVO .env.local COMPLETO

```env
# ===========================================
# MEU ADVOGADO - CONFIGURAÇÕES DE AMBIENTE
# ===========================================

# App
NEXT_PUBLIC_APP_URL=https://meuadvogado-us.vercel.app
NEXTAUTH_URL=https://meuadvogado-us.vercel.app
NEXTAUTH_SECRET=sua-secret-key-aqui-gere-com-openssl

# Database (Vercel Postgres ou Neon)
DATABASE_URL=postgresql://...

# ===========================================
# STRIPE - PAGAMENTOS
# ===========================================
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PROFESSIONAL=price_...
STRIPE_PRICE_ENTERPRISE=price_...

# ===========================================
# RESEND - EMAILS
# ===========================================
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@meuadvogado.us

# ===========================================
# ANTHROPIC - AI (CLAUDE)
# ===========================================
ANTHROPIC_API_KEY=sk-ant-...

# ===========================================
# MIXPANEL - ANALYTICS
# ===========================================
NEXT_PUBLIC_MIXPANEL_TOKEN=...

# ===========================================
# UPSTASH REDIS - CACHE (OPCIONAL)
# ===========================================
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## ✅ CHECKLIST DE CONFIGURAÇÃO

- [ ] Criar conta Stripe e obter API keys
- [ ] Criar produtos Professional ($199) e Enterprise ($499) no Stripe
- [ ] Configurar webhook no Stripe
- [ ] Criar conta Resend e obter API key
- [ ] Verificar domínio no Resend (opcional mas recomendado)
- [ ] Criar conta Anthropic e obter API key
- [ ] Criar conta Mixpanel e obter token
- [ ] (Opcional) Criar Redis no Upstash
- [ ] Adicionar todas as variáveis no Vercel
- [ ] Testar pagamento em modo sandbox
- [ ] Testar envio de email
- [ ] Testar AI matching

---

## 🆘 SUPORTE

Se precisar de ajuda com a configuração:
- Documentação Stripe: https://stripe.com/docs
- Documentação Resend: https://resend.com/docs
- Documentação Anthropic: https://docs.anthropic.com
- Documentação Mixpanel: https://docs.mixpanel.com

---

**Última atualização:** Janeiro 2026
