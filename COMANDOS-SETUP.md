# 🚀 COMANDOS PARA SETUP COMPLETO

## 1️⃣ ENCONTRAR SENHA DO SUPABASE

Acesse: https://supabase.com/dashboard/project/wllgxazexslcatopsmrn/settings/database

Procure por: **Database Password** ou **Connection String**

---

## 2️⃣ CONFIGURAR VERCEL (MANUAL)

Acesse: https://vercel.com/dashboard

Projeto: **meuadvogado-us** → **Settings** → **Environment Variables**

Adicione (substitua `SUA_SENHA` pela senha real):

```
DATABASE_URL=postgresql://postgres:SUA_SENHA@db.wllgxazexslcatopsmrn.supabase.co:5432/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres:SUA_SENHA@db.wllgxazexslcatopsmrn.supabase.co:5432/postgres

ANTHROPIC_API_KEY=sua_chave_anthropic_aqui

NEXTAUTH_SECRET=b2d3bf74ddbb11f0992b4aff05d30ffe

NEXTAUTH_URL=https://meuadvogado-us.vercel.app
```

**Marque todos os ambientes:** Production, Preview, Development

---

## 3️⃣ REDEPLOY NO VERCEL

Após adicionar variáveis:
- Deployments → 3 pontinhos → Redeploy

---

## 4️⃣ SETUP LOCAL (APÓS REDEPLOY)

```powershell
# Navegar para o projeto
cd C:\Users\teste\Desktop\meuadvogado-clean

# Instalar dependências (se ainda não fez)
npm install

# Gerar Prisma Client
npx prisma generate

# Criar tabelas no banco (IMPORTANTE!)
npx prisma db push

# Popular com dados iniciais
npx prisma db seed
```

---

## 5️⃣ TESTAR LOCALMENTE

```powershell
# Rodar servidor local
npm run dev

# Acessar: http://localhost:3000
```

---

## 6️⃣ TESTAR EM PRODUÇÃO

Após redeploy com sucesso:

1. **Formulário de caso:** https://meuadvogado-us.vercel.app/caso
2. **Busca de advogados:** https://meuadvogado-us.vercel.app/advogados
3. **Home:** https://meuadvogado-us.vercel.app/

---

## ⚠️ ORDEM CORRETA

1. ✅ Encontrar senha Supabase
2. ✅ Adicionar variáveis no Vercel
3. ✅ Redeploy no Vercel
4. ✅ Rodar `npx prisma db push` localmente
5. ✅ Rodar `npx prisma db seed` localmente
6. ✅ Testar aplicação

---

## 🆘 SE DER ERRO

**"Invalid connection string"**
→ Senha do Supabase está errada ou tem caracteres especiais

**"Table does not exist"**
→ Você esqueceu de rodar `npx prisma db push`

**"Prisma Client not found"**
→ Rode `npx prisma generate`

**"ANTHROPIC_API_KEY not set"**
→ Variável não foi adicionada no Vercel ou redeploy não foi feito

---

**ME AVISE QUANDO:**
1. Encontrar a senha do Supabase
2. Adicionar as variáveis no Vercel
3. Fazer o redeploy
4. Rodar os comandos locais

**Posso ajudar com qualquer passo!** 🚀
