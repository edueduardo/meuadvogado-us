# 🚀 CONFIGURAR NEON POSTGRESQL - GUIA RÁPIDO

## Passo 1: Criar Conta Neon (2 min)

1. Acesse: https://neon.tech
2. Clique em **Sign up**
3. Use GitHub/Google ou email
4. Confirme email se necessário

## Passo 2: Criar Database (2 min)

1. Após login, clique em **Create a project**
2. **Project name:** `meuadvogado-clean`
3. **Region:** `US East 2 (Ohio)` (mais rápida)
4. **PostgreSQL version:** `15`
5. Clique em **Create project**

## Passo 3: Copiar Credenciais (1 min)

1. Após criar, vá em **Connection details**
2. Copie a **Connection string**
3. Deve ser algo como:
   ```
   postgresql://neondb_owner:SENHA_AQUI@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

## Passo 4: Atualizar .env.local

1. Abra o arquivo `.env.local`
2. Substitua as linhas do banco:

   ```bash
   # Apague as linhas antigas:
   DATABASE_URL="postgresql://postgres:Edu%40rd%401972@db.wllgxazexslcatopsmrn.supabase.co:5432/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres:Edu%40rd%401972@db.wllgxazexslcatopsmrn.supabase.co:5432/postgres"

   # Cole as novas (substitua SENHA_AQUI e ep-xxx):
   DATABASE_URL="postgresql://neondb_owner:SUA_SENHA@ep-SEU_PROJETO.us-east-2.aws.neon.tech/neondb?sslmode=require"
   DIRECT_URL="postgresql://neondb_owner:SUA_SENHA@ep-SEU_PROJETO.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

## Passo 5: Testar Conexão

```bash
npx prisma db push
```

Se funcionar, você verá:
```
✅ Database schema synchronized
✅ Created table User
✅ Created table Lawyer
✅ ... (todas as tabelas)
```

## Passo 6: Iniciar Aplicação

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 💡 Vantagens do Neon

✅ **Grátis:** 1GB storage, 100 horas/mês  
✅ **Rápido:** Setup em 5 minutos  
✅ **Compatível:** 100% PostgreSQL  
✅ **Serverless:** Pausa automaticamente  
✅ **Escalável:** Cresce com seu negócio  

## 🎯 Resultado Final

Após configurar:
- ✅ Sistema 100% funcional
- ✅ Upload de arquivos funcionando
- ✅ Todas as APIs conectadas
- ✅ Pronto para lançar!

---

**Tempo total:** 5-10 minutos  
**Custo:** $0 (grátis para começar)
