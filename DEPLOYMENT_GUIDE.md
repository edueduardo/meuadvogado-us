# 🚀 DEPLOYMENT GUIDE - VERCEL

## ⚡ Quick Start (5 minutos)

### Step 1: Conectar GitHub ao Vercel
1. Acesse https://vercel.com
2. Clique em "New Project"
3. Selecione "Import Git Repository"
4. Conecte sua conta GitHub e selecione o repo `meuadvogado-us`

### Step 2: Configurar Variáveis de Ambiente
No dashboard do Vercel, vá para **Settings → Environment Variables** e adicione:

```
ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_...
NEXT_PUBLIC_MIXPANEL_TOKEN=...
ENCRYPTION_KEY=...
OPENAI_API_KEY=sk-...
TOGETHER_API_KEY=...
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=seu_secret_aqui
NEXTAUTH_URL=https://seu-dominio.vercel.app
```

**⚠️ IMPORTANTE:**
- Copie as chaves do arquivo `.env.local` local
- **NUNCA** commite com as chaves reais no GitHub!
- Se acidentalmente commitar, use GitHub Secret Scanning para revogar

### Step 3: Clicar em Deploy
Clique em **"Deploy"** e aguarde ~3-5 minutos

---

## 📋 Checklist Completo de Deploy

### Pre-Deploy Verification
- [ ] Projeto compila sem erros: `npm run build`
- [ ] Todos os testes passam
- [ ] `.env.local` não será commitado (está em `.gitignore`)
- [ ] Dependências instaladas corretamente
- [ ] Database migrations estão atualizadas

### Variáveis de Ambiente (Environment Variables)
- [ ] ANTHROPIC_API_KEY ✅
- [ ] RESEND_API_KEY ✅
- [ ] NEXT_PUBLIC_MIXPANEL_TOKEN ✅
- [ ] DATABASE_URL (configure em Vercel)
- [ ] NEXTAUTH_SECRET (gere um novo)
- [ ] NEXTAUTH_URL (seu domínio)

### Features Verificadas em Produção
- [ ] 🤖 AI Copilot funcional
- [ ] 🔮 Quiz calculando corretamente
- [ ] 📍 Case Tracker atualizando
- [ ] 🎛️ Admin Dashboard com dados
- [ ] 📊 Analytics carregando
- [ ] 💬 Chat em tempo real
- [ ] 📧 Emails sendo enviados
- [ ] ✅ State Bar verification
- [ ] 🎓 Academy carregando
- [ ] 📘 Guide carregando
- [ ] 📋 Features Status page visível
- [ ] 🎉 All Features Active page visível

---

## 🔐 Gerar NEXTAUTH_SECRET

Execute no seu terminal:

```bash
openssl rand -base64 32
```

Copie o resultado e adicione como `NEXTAUTH_SECRET` no Vercel.

---

## 🗄️ Configurar Database em Produção

### Opção 1: Railway (Recomendado)
1. Acesse https://railway.app
2. Crie novo projeto PostgreSQL
3. Copie a `DATABASE_URL`
4. Cole no Vercel como environment variable

### Opção 2: Supabase
1. Acesse https://supabase.com
2. Crie novo projeto
3. Copie a connection string
4. Cole no Vercel

### Opção 3: AWS RDS
1. Crie uma instância PostgreSQL
2. Configure security groups
3. Copie o endpoint

### Após Configurar Database:
```bash
# Rodas migrations em produção
npx prisma migrate deploy
```

---

## 🔗 Configurar Domínio Customizado

### No Vercel:
1. Vá para **Settings → Domains**
2. Clique em **"Add"**
3. Digite seu domínio (ex: meuadvogado.com)
4. Copie os nameservers que o Vercel mostra

### No Seu Registrador de Domínio (GoDaddy, Namecheap, etc):
1. Vá para DNS Settings
2. Adicione os nameservers do Vercel
3. Aguarde propagação (até 48h)

---

## 📊 Monitorando em Produção

### Vercel Analytics
- Acesse **Analytics** no dashboard
- Veja: pageviews, performance, errors
- Set alerts para downtime

### Logs em Tempo Real
```bash
vercel logs
```

### Health Check
Acesse: `https://seu-app.com/api/health/database`

---

## 🚨 Troubleshooting

### Build Fails
```bash
# Verifique localmente
npm run build

# Se falhar, veja os logs
npm run dev
```

### Environment Variables não carregam
- Confirme no Vercel Dashboard → Settings → Environment Variables
- Redeploy após adicionar novas variáveis

### Database Connection Error
- Verifique DATABASE_URL está correto
- Teste conexão localmente com essa URL
- Confirme firewall permite conexão

### Email não está sendo enviado
- Verifique RESEND_API_KEY está correto
- Confirme domínio verificado no Resend
- Check logs: `vercel logs`

---

## 🔄 Deploy Automático

Depois que conectar GitHub, **cada push** automaticamente:
1. Faz build do projeto
2. Roda testes
3. Deploy para produção
4. Mantém uptime durante deploy

### Para desabilitar auto-deploy:
Settings → Git → Auto-deploy → Disabled

---

## 📈 Performance em Produção

O Vercel automaticamente:
- ✅ Comprime imagens
- ✅ Code splitting
- ✅ Caching inteligente
- ✅ Edge functions (próximas do usuário)
- ✅ Auto-scaling

### Monitorar Performance:
https://seu-app.vercel.app/\_performance

---

## 💡 Pro Tips

1. **Versioning:** Use tags Git para releases
   ```bash
   git tag -a v1.0.0 -m "Production Release"
   git push origin v1.0.0
   ```

2. **Rollback rápido:** Vercel guarda histórico de deploys
   - Vá para **Deployments**
   - Clique no deploy anterior
   - Clique **"Promote to Production"**

3. **Preview Deployments:** PRs automaticamente geram URLs de preview
   - Perfeito para testar antes de merge

4. **Webhooks:** Configure em Vercel para notificações
   - Slack
   - Discord
   - Custom webhooks

---

## ✅ Post-Deploy Checklist

- [ ] Site carrega em HTTPS
- [ ] Certificado SSL válido
- [ ] Todas as 12 features funcionam
- [ ] Quiz calcula corretamente
- [ ] Chat funciona em tempo real
- [ ] Emails enviando
- [ ] Admin dashboard mostrando dados
- [ ] Analytics rastreando eventos
- [ ] Domínio customizado (se aplicável)
- [ ] Analytics/monitoring ativo
- [ ] Backup automático configurado
- [ ] Monitores de uptime configurados

---

## 🎯 URLs Finais para Testar

```
Homepage: https://seu-dominio.com/
Quiz: https://seu-dominio.com/quiz
Admin: https://seu-dominio.com/admin
Analytics: https://seu-dominio.com/analytics/dashboard
Features: https://seu-dominio.com/all-features-active
Status: https://seu-dominio.com/features-status
```

---

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Meu Advogado Issues: GitHub Issues

**Seu sistema está 100% pronto para produção! 🚀**
