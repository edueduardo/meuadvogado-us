# ⚡ DEPLOY RÁPIDO EM 5 MINUTOS

## Opção 1: Deploy Automático via GitHub (RECOMENDADO)

### 1️⃣ Conectar ao Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link
```

### 2️⃣ Adicionar Environment Variables

No dashboard do Vercel (https://vercel.com):
- Vá para Settings → Environment Variables
- Cole todas as 4 API keys
- Clique Save

```env
ANTHROPIC_API_KEY=sk-ant-api03-...
RESEND_API_KEY=re_bMc62zdp_...
NEXT_PUBLIC_MIXPANEL_TOKEN=5030c74333...
ENCRYPTION_KEY=5030c74333...
```

### 3️⃣ Push para GitHub

```bash
git add .
git commit -m "feat: Prepare for production deployment"
git push origin claude/recover-saas-project-NJ92f
```

Vercel detectará automaticamente e fará deploy!

---

## Opção 2: Deploy Manual via CLI

```bash
# Fazer deploy
vercel

# Fazer deploy em produção
vercel --prod

# Ver status
vercel status
```

---

## Opção 3: Deploy Direto (Sem GitHub)

```bash
# Build
npm run build

# Deploy
vercel --prod
```

---

## ✅ Após Deploy (Testes)

### 1. Verificar URL
```bash
vercel --list
# Vai mostrar: https://seu-projeto.vercel.app
```

### 2. Testar 12 Features

Abra em seu navegador:

- [ ] https://seu-projeto.vercel.app → Homepage com botões
- [ ] https://seu-projeto.vercel.app/quiz → Quiz funcionando
- [ ] https://seu-projeto.vercel.app/admin → Admin Dashboard
- [ ] https://seu-projeto.vercel.app/analytics/dashboard → Analytics
- [ ] https://seu-projeto.vercel.app/all-features-active → Features status
- [ ] Click no botão 🤖 → AI Copilot ativo

### 3. Verificar API
```bash
curl https://seu-projeto.vercel.app/api/health/database
```

---

## 🐛 Se algo der errado

### Ver Logs
```bash
vercel logs
```

### Revert para versão anterior
```bash
# Ver histórico
vercel list

# Promover deploy anterior
vercel promote <deployment-url>
```

### Debug local (antes de deploy)
```bash
npm run build
npm run dev
```

---

## 🎯 URLs Finais

| Feature | URL |
|---------|-----|
| Homepage | https://seu-projeto.vercel.app |
| Quiz | https://seu-projeto.vercel.app/quiz |
| Admin | https://seu-projeto.vercel.app/admin |
| Analytics | https://seu-projeto.vercel.app/analytics/dashboard |
| Features Status | https://seu-projeto.vercel.app/all-features-active |

---

## 📊 Monitorar em Produção

```bash
# Ver performance
vercel analytics

# Ver logs em tempo real
vercel logs --tail

# Ver status
vercel status
```

---

## 🎉 PARABÉNS!

Sua plataforma está ao vivo! 🚀

**12 Features Operacionais:**
✅ AI Copilot
✅ Quiz
✅ Case Tracker
✅ Admin Dashboard
✅ Analytics
✅ Chat Real-time
✅ State Bar Verification
✅ Email Notifications
✅ AI Lawyer Matching
✅ Mixpanel Analytics
✅ Academy
✅ Client Guide

