# 🚀 CRIAR NOVO PROJETO SUPABASE - 5 MINUTOS

## ⚠️ SITUAÇÃO ATUAL

O projeto `wllgxazexslcatopsmrn` está com problemas de conectividade no banco de dados, mesmo aparecendo como "verde" no painel. A solução mais rápida é criar um novo projeto.

---

## 📋 PASSO A PASSO

### **1. Criar Novo Projeto (2 min)**

1. Acesse: https://supabase.com/dashboard
2. Clique em **New project**
3. Preencha:
   - **Name:** `meuadvogado-production`
   - **Database Password:** Crie uma senha forte (anote!)
   - **Region:** `West US (Oregon)` ou `East US (N. Virginia)`
   - **Pricing Plan:** Free

4. Clique em **Create new project**
5. Aguarde 2-3 minutos (criação do banco)

### **2. Copiar Credenciais (1 min)**

1. Após criado, vá em **Settings → Database**
2. Role até **Connection string**
3. Selecione **URI** (não pooling)
4. Copie a string completa
5. Deve ser algo como:
   ```
   postgresql://postgres:[SUA-SENHA]@db.xxxxx.supabase.co:5432/postgres
   ```

### **3. Atualizar .env (1 min)**

Abra o arquivo `.env` e substitua:

```bash
# Database (Supabase)
DATABASE_URL="postgresql://postgres:SUA_SENHA@db.NOVO_PROJETO.supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:SUA_SENHA@db.NOVO_PROJETO.supabase.co:5432/postgres"
```

**IMPORTANTE:** Se a senha tiver `@`, substitua por `%40`

### **4. Testar Conexão (1 min)**

```bash
npx prisma db push
```

Você deve ver:
```
✅ Database schema synchronized
✅ Created table User
✅ Created table Lawyer
✅ Created table Client
✅ ... (todas as tabelas)
```

### **5. Iniciar Aplicação**

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## ✅ RESULTADO FINAL

- ✅ Banco PostgreSQL novo e funcional
- ✅ Todas as tabelas criadas
- ✅ Sistema 100% operacional
- ✅ Pronto para lançar!

---

## 💰 CUSTO

**Grátis:** 500MB database, 1GB file storage, 2GB bandwidth

---

**Tempo total:** 5-10 minutos  
**Dificuldade:** Fácil  
**Resultado:** Sistema 100% funcional! 🎉
