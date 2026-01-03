# 🎯 COMO POPULAR O BANCO DE DADOS COM DADOS REAIS

## 🚨 **PROBLEMA: "NÃO VEJO NADA NA HOMEPAGE"**

**CAUSA:** O banco de dados estava vazio! Sem advogados, sem clientes, sem casos = homepage mostra zeros.

**SOLUÇÃO:** Rodar o seed completo que cria dados de teste realistas.

---

## 🚀 **SOLUÇÃO RÁPIDA (1 COMANDO)**

```bash
npx tsx prisma/seed-complete.ts
```

**Isso criará:**
- ✅ **6 advogados verificados** (Miami, NY, Boston, LA, Orlando)
- ✅ **5 clientes** com contas ativas
- ✅ **3 casos reais** (imigração, acidentes, divórcio)
- ✅ **3 reviews** com ratings 4-5 estrelas
- ✅ **8 áreas de prática** (Imigração, Acidentes, Família, etc)

---

## 📋 **DADOS CRIADOS**

### **👨‍⚖️ ADVOGADOS:**

| Nome | Cidade | Especialidade | Plano | Status |
|------|--------|---------------|-------|--------|
| Dr. João Silva | Miami, FL | Imigração e Vistos | PREMIUM | ✅ Verificado, ⭐ Destaque |
| Dra. Maria Santos | New York, NY | Acidentes Pessoais | FEATURED | ✅ Verificado, ⭐ Destaque |
| Dr. Carlos Oliveira | Boston, MA | Direito de Família | PREMIUM | ✅ Verificado |
| Dra. Ana Costa | Los Angeles, CA | Direito Empresarial | PREMIUM | ✅ Verificado, ⭐ Destaque |
| Dr. Pedro Almeida | Miami, FL | Defesa Criminal | PREMIUM | ✅ Verificado |
| Dra. Juliana Ferreira | Orlando, FL | Imigração e Asilo | PREMIUM | ✅ Verificado |

**Login de teste:**
- Email: `joao.silva@meuadvogado.us`
- Senha: `senha123`

### **👥 CLIENTES:**

| Nome | Email | Cidade |
|------|-------|--------|
| Roberto Mendes | roberto.mendes@email.com | Miami, FL |
| Fernanda Lima | fernanda.lima@email.com | New York, NY |
| Lucas Martins | lucas.martins@email.com | Boston, MA |
| Camila Rocha | camila.rocha@email.com | Los Angeles, CA |
| Bruno Carvalho | bruno.carvalho@email.com | Orlando, FL |

**Login de teste:**
- Email: `roberto.mendes@email.com`
- Senha: `senha123`

### **📋 CASOS:**

1. **Pedido de Green Card por Casamento** (Status: NEW)
   - Cliente: Roberto Mendes
   - Área: Imigração

2. **Acidente de Carro - Lesões Graves** (Status: ANALYZING)
   - Cliente: Fernanda Lima
   - Área: Acidentes Pessoais
   - Advogado: Dra. Maria Santos

3. **Processo de Divórcio** (Status: MATCHED)
   - Cliente: Lucas Martins
   - Área: Direito de Família
   - Advogado: Dr. Carlos Oliveira

### **⭐ REVIEWS:**

- João Silva: 5 estrelas - "Excelente profissional!"
- Maria Santos: 5 estrelas - "Advogada incrível!"
- Carlos Oliveira: 4 estrelas - "Muito profissional!"

---

## 🎯 **O QUE VOCÊ VERÁ AGORA**

### **📍 HOMEPAGE (`/`)**

**Estatísticas (seção azul):**
```
6 Advogados (6 verificados)
5 Cidades
8 Áreas de Atuação
3 Casos
```

**Advogados Recentes (cards):**
- 6 cards com fotos, badges, áreas de atuação, ratings
- Badges: ✅ Verificado, ⭐ Destaque
- Ratings: 4.0 - 5.0 estrelas
- Link para perfil de cada advogado

### **📍 PÁGINA DE ADVOGADOS (`/advogados`)**

- Lista completa dos 6 advogados
- Filtros por cidade, estado, área
- Ordenação por destaque, plano, verificação

### **📍 DASHBOARD DO ADVOGADO (`/advogado/dashboard`)**

**Faça login com:**
- Email: `joao.silva@meuadvogado.us`
- Senha: `senha123`

**Você verá:**
- Estatísticas do perfil
- Leads recebidos
- Casos em andamento
- Gráficos de performance

### **📍 DASHBOARD DO CLIENTE (`/cliente/dashboard`)**

**Faça login com:**
- Email: `roberto.mendes@email.com`
- Senha: `senha123`

**Você verá:**
- Seus casos
- Advogados contatados
- Status dos processos

---

## 🔄 **COMO LIMPAR E REPOPULAR**

Se quiser limpar tudo e começar de novo:

```bash
# 1. Limpar banco (CUIDADO: apaga tudo!)
npx prisma migrate reset --force

# 2. Popular novamente
npx tsx prisma/seed-complete.ts
```

---

## 🛠️ **TROUBLESHOOTING**

### **Problema: "Ainda vejo zeros na homepage"**

**Solução:**
1. Verifique se o seed rodou com sucesso (deve mostrar "✅ Created...")
2. Reinicie o servidor: `Ctrl+C` e depois `npm run dev`
3. Limpe o cache do navegador: `Ctrl+Shift+R`
4. Verifique se está conectado ao banco correto (`.env.local`)

### **Problema: "Erro ao rodar seed"**

**Solução:**
1. Verifique se o Prisma está atualizado: `npx prisma generate`
2. Verifique se o banco está acessível
3. Verifique as variáveis de ambiente (`.env.local`)

### **Problema: "Login não funciona"**

**Solução:**
1. Use as credenciais exatas do seed
2. Senha padrão: `senha123`
3. Verifique se NextAuth está configurado

---

## 📊 **VERIFICAR SE FUNCIONOU**

### **Via API (teste manual):**

```bash
# 1. Stats da homepage
curl http://localhost:3000/api/stats

# Deve retornar:
# { "lawyers": { "total": 6, "verified": 6, ... } }

# 2. Advogados recentes
curl http://localhost:3000/api/lawyers/recent

# Deve retornar:
# { "lawyers": [ { "name": "Dr. João Silva", ... } ] }

# 3. Todos os advogados
curl http://localhost:3000/api/advogados

# Deve retornar:
# { "lawyers": [ ... 6 advogados ... ] }
```

### **Via Browser:**

1. Abra: `http://localhost:3000`
2. Veja se os números aparecem (não zeros)
3. Role para baixo e veja os 6 cards de advogados
4. Clique em "Ver Todos os Advogados"
5. Deve mostrar a lista completa

---

## 🎯 **PRÓXIMOS PASSOS**

Agora que o banco está populado:

1. **Teste o login:**
   - `/login` → Use `joao.silva@meuadvogado.us` / `senha123`

2. **Explore os dashboards:**
   - `/advogado/dashboard` (como advogado)
   - `/cliente/dashboard` (como cliente)

3. **Teste o chat:**
   - `/chat` (precisa estar logado)

4. **Crie novos casos:**
   - `/caso` (formulário de novo caso)

5. **Adicione mais dados:**
   - Edite `prisma/seed-complete.ts` e adicione mais advogados/clientes
   - Rode novamente: `npx tsx prisma/seed-complete.ts`

---

## 🚀 **DEPLOY EM PRODUÇÃO**

Para popular o banco em produção (Vercel):

```bash
# 1. Commit o seed
git add prisma/seed-complete.ts
git commit -m "feat: seed completo com dados reais"
git push

# 2. No Vercel, rode via terminal:
npx tsx prisma/seed-complete.ts

# Ou configure no package.json:
"scripts": {
  "seed": "tsx prisma/seed-complete.ts"
}

# E rode:
npm run seed
```

---

## ✅ **CHECKLIST DE VERIFICAÇÃO**

- [ ] Seed rodou sem erros
- [ ] Homepage mostra números reais (não zeros)
- [ ] Seção de advogados recentes aparece
- [ ] 6 cards de advogados são visíveis
- [ ] Login funciona com credenciais do seed
- [ ] Dashboard do advogado mostra dados
- [ ] Dashboard do cliente mostra casos
- [ ] APIs retornam JSON com dados

**Se todos os itens estão ✅, o sistema está funcionando perfeitamente!**

---

## 📞 **SUPORTE**

Se ainda tiver problemas:

1. Verifique os logs do servidor (`npm run dev`)
2. Verifique o console do navegador (F12)
3. Teste as APIs manualmente (curl ou Postman)
4. Verifique se o banco está acessível
5. Verifique as variáveis de ambiente

**Lembre-se: O sistema só mostra dados REAIS do banco. Se o banco está vazio, a homepage mostra zeros. Isso é transparência total! 🎯**
