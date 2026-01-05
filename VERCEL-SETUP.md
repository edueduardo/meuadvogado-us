# 🚀 VERCEL SETUP - CONFIGURAÇÃO RÁPIDA

**Tempo estimado:** 30 minutos  
**Objetivo:** Configurar todas as variáveis de ambiente no Vercel

---

## 📋 **CHECKLIST DE VARIÁVEIS ESSENCIAIS**

### **CRÍTICO (Funciona sem, mas limitado)**
- ✅ `NEXTAUTH_SECRET` - Autenticação
- ✅ `DATABASE_URL` - PostgreSQL
- ✅ `UPSTASH_REDIS_REST_URL` - Rate limiting
- ✅ `UPSTASH_REDIS_REST_TOKEN` - Rate limiting

### **IMPORTANTE (Features não funcionam sem)**
- ⚠️ `RESEND_API_KEY` - Emails
- ⚠️ `STRIPE_SECRET_KEY` - Pagamentos
- ⚠️ `ANTHROPIC_API_KEY` - IA

---

## 🔧 **PASSO A PASSO - VERCEL DASHBOARD**

### **1. Abrir Environment Variables**
1. Vá para: https://vercel.com/edueduardo/meuadvogado-us/settings/environment-variables
2. Clique em "Add New"

### **2. Adicionar Variáveis Essenciais**

#### **NEXTAUTH_SECRET**
```
Name: NEXTAUTH_SECRET
Value: super-secret-key-min-32-caracteres-aqui-1234567890123456
Environment: Production, Preview, Development
```

#### **DATABASE_URL**
```
Name: DATABASE_URL
Value: postgresql://postgres:senha@host:5432/meuadvogado_us
Environment: Production, Preview, Development
```

#### **UPSTASH_REDIS REST**
```
Name: UPSTASH_REDIS_REST_URL
Value: https://your-workspace.upstash.io
Environment: Production, Preview, Development

Name: UPSTASH_REDIS_REST_TOKEN
Value: your-upstash-redis-token
Environment: Production, Preview, Development
```

### **3. Adicionar Chaves de Serviços**

#### **RESEND (Email)**
```
Name: RESEND_API_KEY
Value: re_your_resend_api_key_here
Environment: Production, Preview, Development

Name: RESEND_FROM_EMAIL
Value: noreply@meuadvogado-us.vercel.app
Environment: Production, Preview, Development
```

#### **STRIPE (Pagamentos)**
```
Name: STRIPE_SECRET_KEY
Value: sk_test_your_stripe_secret_key
Environment: Production, Preview, Development

Name: STRIPE_PUBLISHABLE_KEY
Value: pk_test_your_stripe_publishable_key
Environment: Production, Preview, Development

Name: STRIPE_WEBHOOK_SECRET
Value: whsec_your_webhook_secret
Environment: Production, Preview, Development
```

#### **ANTHROPIC (IA)**
```
Name: ANTHROPIC_API_KEY
Value: sk-ant-your_anthropic_api_key_here
Environment: Production, Preview, Development
```

---

## 🎯 **OPÇÕES DE SERVIÇOS (GRATUITOS/TESTE)**

### **1. PostgreSQL - Vercel Postgres (FREE)**
1. Vá para: https://vercel.com/dashboard/stores
2. Clique "Create Database"
3. Escolha "Postgres"
4. Configure e copie `DATABASE_URL`

### **2. Redis - Upstash Redis (FREE)**
1. Vá para: https://console.upstash.com/
2. Criar conta gratuita
3. Criar Redis Database
4. Copiar URL e Token

### **3. Email - Resend (FREE)**
1. Vá para: https://resend.com/
2. Criar conta gratuita
3. Copiar API key
4. Configurar domínio de envio

### **4. Pagamentos - Stripe (TESTE)**
1. Vá para: https://dashboard.stripe.com/test/apikeys
2. Copiar keys de teste
3. Configurar webhook

### **5. IA - Anthropic Claude (FREE)**
1. Vá para: https://console.anthropic.com/
2. Criar conta gratuita
3. Copiar API key

---

## ✅ **TESTE PÓS-CONFIGURAÇÃO**

### **1. Verificar Build**
```bash
# Commit e push para trigger build
git add -A
git commit -m "feat: environment variables configured"
git push origin master
```

### **2. Testar API**
```bash
# Testar rate limiting
curl https://meuadvogado-us.vercel.app/api/consultations/create

# Testar autenticação
curl -X POST https://meuadvogado-us.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

### **3. Verificar Logs**
1. Vá para: https://vercel.com/edueduardo/meuadvogado-us/logs
2. Verificar se não há mais erros Redis

---

## 🔍 **VERIFICAÇÃO FINAL**

### **Features Testadas:**
- ✅ Autenticação NextAuth funciona
- ✅ Rate limiting funciona
- ✅ Database connection ok
- ✅ Build sem warnings
- ✅ API endpoints respondem

### **Se tiver erros:**
1. Verificar spelling das variáveis
2. Verificar environment (Production vs Preview)
3. Verificar se há espaços extras
4. Fazer redeploy manual

---

## 🚀 **PRÓXIMO PASSO**

Após configurar variáveis:
1. Testar VIDEO CONSULTAS API
2. Implementar UI Frontend (Opção C)
3. Adicionar testes (Opção B)
4. Implementar WebSocket (Opção A)

**Status esperado:** 8/10 features funcionando

---

## 📞 **SUPORTE**

Se precisar ajuda:
1. Logs Vercel: `/logs`
2. Functions: `/functions`
3. Environment: `/settings/environment-variables`

**Deploy atual:** https://meuadvogado-us.vercel.app