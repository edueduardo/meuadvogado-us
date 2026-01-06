# 🔄 Workflow: Claude (Backend) + Windsurf (Frontend)

## 📊 Status Geral do Projeto

**Metodologia**: Divisão clara de responsabilidades
- **Claude**: Backend (APIs, banco de dados, lógica)
- **Windsurf**: Frontend (UI, UX, componentes)

---

## 🎯 TAREFAS PLANEJADAS

### ✅ TAREFA #1: Email Verification Backend
**Status**: 🟢 COMPLETO (Claude)
**Commit**: `df19427`
**O que foi feito**:
- ✅ Modelo `EmailVerificationToken` no Prisma
- ✅ Helpers para gerar e validar tokens
- ✅ Endpoint `POST /api/auth/register` envia email
- ✅ Endpoint `GET /api/auth/verify?token=XXX` confirma email
- ✅ Login validado - rejeita se email não verificado
- ✅ Build passou (npm run build)

**Próximo**: Windsurf implementa UI → Ver `/TAREFA-2-WINDSURF.md`

---

### 🟡 TAREFA #2: Email Verification UI
**Status**: 🔵 AGUARDANDO WINDSURF
**Detalhes em**: `/TAREFA-2-WINDSURF.md`

**O que Windsurf precisa fazer**:
1. Página `/auth/verify-email` com validação de token
2. Modal/card na tela de registro com "Email enviado"
3. Endpoint `POST /api/auth/resend-verification` para reenviar
4. (Opcional) Página `/auth/resend-verification` com formulário

**Deadline**: Quando terminar, executar `npm run build` para testar

---

### 🔜 TAREFA #3: Real-time Chat (WebSocket)
**Status**: 🔴 PENDENTE (Claude vai fazer após Windsurf #2)

**Backend Claude vai implementar**:
- Socket.IO integration
- Real-time message broadcasting
- Typing indicators
- Online/offline presence
- Delivery confirmation

**Frontend Windsurf vai fazer**:
- Chat UI improvements
- Typing indicator animation
- Real-time message display
- Presence badges

---

### 🔜 TAREFA #4: Escrow Payments
**Status**: 🔴 PENDENTE

**Backend Claude vai implementar**:
- Milestone-based payments
- Stripe integration (already partial)
- Release logic
- Webhook handling with idempotency

**Frontend Windsurf vai fazer**:
- Payment flow UI
- Milestone management interface
- Receipt/invoice pages

---

### 🔜 TAREFA #5: Compliance Automation
**Status**: 🔴 PENDENTE

**Backend Claude vai implementar**:
- OAB license verification
- Auto-suspend logic
- Notification system

**Frontend Windsurf vai fazer**:
- Compliance dashboard
- License upload interface
- Notification center UI

---

## 🔄 PROTOCOLO DE HANDOFF

### Quando Claude Termina uma Tarefa:

1. **Implementa backend completo** (código testado, build passa)
2. **Cria documentação clara** em arquivo `.md` na raiz
3. **Faz commit com descrição detalhada**
4. **Push para a branch** `claude/recover-saas-project-NJ92f`
5. **Documenta exatamente o que Windsurf deve fazer**
6. **Pronto para o usuário colar no Windsurf**

### Quando Windsurf Termina uma Tarefa:

1. **Implementa frontend** com base na documentação
2. **Testa com `npm run build`** para garantir compilação
3. **Usuário retorna com o código** para Claude
4. **Claude faz merge/pull** e prepara próxima tarefa backend

---

## 📁 Documentação por Tarefa

- **TAREFA #2**: Ver `/TAREFA-2-WINDSURF.md` ← Windsurf lê AQUI

Para futuras tarefas, Claude criará arquivos similares:
- `TAREFA-3-WINDSURF.md`
- `TAREFA-4-WINDSURF.md`
- etc...

---

## 🛠️ Tecnologias Utilizadas

### Backend (Claude)
- Next.js 15.5.9 (App Router)
- NextAuth.js v4 (JWT auth)
- Prisma v5 (ORM)
- PostgreSQL (Supabase)
- Resend (Email)
- TypeScript

### Frontend (Windsurf)
- Next.js (React components)
- Tailwind CSS (styling)
- TypeScript

### DevOps
- Git (feature branches)
- Vercel (deployment)
- npm (package manager)

---

## 📝 Git Workflow

**Branch padrão**: `claude/recover-saas-project-NJ92f`

**Commits Claude**:
```
feat: implement email verification backend
fix: resolve compilation errors
refactor: optimize database queries
```

**Commits Windsurf**:
```
ui: create email verification page
feat: add resend email functionality
style: improve form styling
```

---

## 🎯 Objetivo Final

Transformar o MeuAdvogado em uma plataforma SaaS completa e funcional com:
- ✅ Email verification (em progresso)
- Real-time chat
- Secure payments (escrow)
- Compliance automation
- Mobile-ready (PWA)
- Machine learning matching

**Meta de Completeness**: 10/10 (atualmente 4.3/10)

---

## 📞 Contato

Se houver dúvidas:
1. Claude → Backend questions
2. Windsurf → Frontend questions
3. Usuário → Coordena entre os dois

