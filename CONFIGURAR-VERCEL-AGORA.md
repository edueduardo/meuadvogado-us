# 🚀 CONFIGURAR VERCEL - COPIE E COLE

## 📋 VARIÁVEIS PARA ADICIONAR NO VERCEL

Acesse: https://vercel.com/dashboard
Projeto: **meuadvogado-us** → **Settings** → **Environment Variables**

---

### 1. DATABASE_URL

**Nome:** `DATABASE_URL`

**Valor:** (@ codificado como %40)
```
postgresql://postgres:Edu%40rd%401972@db.wllgxazexslcatopsmrn.supabase.co:5432/postgres?pgbouncer=true
```

**Ambientes:** ✅ Production, ✅ Preview, ✅ Development

---

### 2. DIRECT_URL

**Nome:** `DIRECT_URL`

**Valor:** (@ codificado como %40)
```
postgresql://postgres:Edu%40rd%401972@db.wllgxazexslcatopsmrn.supabase.co:5432/postgres
```

**Ambientes:** ✅ Production, ✅ Preview, ✅ Development

---

### 3. ANTHROPIC_API_KEY

**Nome:** `ANTHROPIC_API_KEY`

**Valor:**
```
ANTHROPIC_API_KEY=sua_chave_anthropic_aqui
```

**Ambientes:** ✅ Production, ✅ Preview, ✅ Development

---

### 4. NEXTAUTH_SECRET

**Nome:** `NEXTAUTH_SECRET`

**Valor:**
```
b2d3bf74ddbb11f0992b4aff05d30ffe
```

**Ambientes:** ✅ Production, ✅ Preview, ✅ Development

---

### 5. NEXTAUTH_URL

**Nome:** `NEXTAUTH_URL`

**Valor:**
```
https://meuadvogado-us.vercel.app
```

**Ambientes:** ✅ Production apenas

---

## ✅ APÓS ADICIONAR TODAS AS VARIÁVEIS

1. Vá em: **Deployments**
2. Clique nos **3 pontinhos** do último deployment
3. Clique em: **Redeploy**
4. Aguarde ~3 minutos

---

## 🎯 PRÓXIMO PASSO (APÓS REDEPLOY)

Volte aqui e me avise que o redeploy terminou.

Vou ajudar você a rodar os comandos para criar as tabelas no banco:

```powershell
npx prisma generate
npx prisma db push
npx prisma db seed
```

---

**IMPORTANTE:** Não compartilhe este arquivo com ninguém (contém senha do banco)!
