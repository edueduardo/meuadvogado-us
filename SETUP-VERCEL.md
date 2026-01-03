# 🚀 SETUP VERCEL - VARIÁVEIS DE AMBIENTE

## 1️⃣ ACESSAR VERCEL

1. Acesse: https://vercel.com/dashboard
2. Clique no projeto: **meuadvogado-us**
3. Vá em: **Settings** → **Environment Variables**

---

## 2️⃣ ADICIONAR VARIÁVEIS (UMA POR UMA)

### ⚠️ IMPORTANTE: Substitua `[YOUR-PASSWORD]` pela senha real do Supabase!

Para encontrar a senha:
- Acesse: https://supabase.com/dashboard/project/wllgxazexslcatopsmrn/settings/database
- Copie a senha do banco de dados

---

### 📝 VARIÁVEIS PARA ADICIONAR:

#### DATABASE_URL
```
postgresql://postgres:SUA_SENHA_AQUI@db.wllgxazexslcatopsmrn.supabase.co:5432/postgres?pgbouncer=true
```
- Environment: **Production**, **Preview**, **Development** (marcar todos)

#### DIRECT_URL
```
postgresql://postgres:SUA_SENHA_AQUI@db.wllgxazexslcatopsmrn.supabase.co:5432/postgres
```
- Environment: **Production**, **Preview**, **Development** (marcar todos)

#### ANTHROPIC_API_KEY=sua_chave_anthropic_aqui
- Environment: **Production**, **Preview**, **Development** (marcar todos)

#### NEXTAUTH_SECRET
```
b2d3bf74ddbb11f0992b4aff05d30ffe
```
- Environment: **Production**, **Preview**, **Development** (marcar todos)

#### NEXTAUTH_URL
```
https://meuadvogado-us.vercel.app
```
- Environment: **Production** apenas

---

## 3️⃣ REDEPLOY

Após adicionar TODAS as variáveis:

1. Vá em: **Deployments**
2. Clique nos **3 pontinhos** do último deployment
3. Clique em: **Redeploy**
4. Aguarde ~3 minutos

---

## 4️⃣ SETUP DO BANCO DE DADOS (APÓS DEPLOY)

Depois que o deploy passar, rode localmente:

```bash
cd C:\Users\teste\Desktop\meuadvogado-clean

# Gerar Prisma Client
npx prisma generate

# Criar tabelas no banco
npx prisma db push

# Popular com dados iniciais
npx prisma db seed
```

---

## ✅ CHECKLIST

- [ ] Encontrei a senha do Supabase
- [ ] Adicionei DATABASE_URL no Vercel (com senha real)
- [ ] Adicionei DIRECT_URL no Vercel (com senha real)
- [ ] Adicionei ANTHROPIC_API_KEY no Vercel
- [ ] Adicionei NEXTAUTH_SECRET no Vercel
- [ ] Adicionei NEXTAUTH_URL no Vercel
- [ ] Fiz redeploy no Vercel
- [ ] Rodei `npx prisma db push` localmente
- [ ] Rodei `npx prisma db seed` localmente

---

## 🆘 PROBLEMAS COMUNS

### "Invalid connection string"
- Verifique se substituiu `[YOUR-PASSWORD]` pela senha real
- Senha não pode ter caracteres especiais sem encoding

### "Prisma Client not found"
- Rode: `npx prisma generate`

### "Table does not exist"
- Rode: `npx prisma db push`

---

## 📞 PRÓXIMOS PASSOS APÓS SETUP

1. Testar formulário de caso: https://meuadvogado-us.vercel.app/caso
2. Verificar se análise IA funciona
3. Cadastrar primeiro advogado manualmente no banco
4. Testar busca de advogados

---

**Qualquer dúvida, me avise!** 🚀
