# Autenticação — Status e Roadmap

**Data**: 2026-01-05
**Status Atual**: ❌ Não implementado
**Prioridade**: 🔴 CRÍTICA

---

## 1. Estado Atual

### Sistema de Autenticação
- ❌ **NextAuth**: Não instalado
- ❌ **Supabase Auth**: Não instalado
- ❌ **JWT Custom**: Não implementado
- ❌ **Session Management**: Não existente

### Endpoints Protegidos
| Endpoint | Status | Razão |
|----------|--------|-------|
| `POST /api/advogados` | 🔴 Bloqueado | Requer auth |
| `GET /api/dashboard` | 🔴 Bloqueado | Requer auth |
| `POST /api/stripe/upgrade` | 🔴 Bloqueado | Requer auth + email |

### Rotas Privadas (Páginas)
| Rota | Status | Proteção Atual |
|------|--------|----------------|
| `/dashboard` | ⚠️ Acessível | Sem autenticação |
| `/dashboard/analytics` | ⚠️ Acessível | Sem autenticação |
| `/dashboard/perfil` | ⚠️ Acessível | Sem autenticação |
| `/cadastro` | ⚠️ Acessível | Sem autenticação |
| `/login` | ⚠️ Acessível | Sem autenticação |

### Funções de Autenticação
- ✅ **Stub criado**: `lib/auth.ts`
  - `getUserFromRequest(req)` → sempre retorna `null`
  - `getUserEmailFromRequest(req)` → sempre retorna `null`
  - `requireAuth(req)` → sempre lança erro
  - Pronto para implementação real

---

## 2. Arquitetura Planejada

### Fluxo de Autenticação (Proposed)

```
User Login
    ↓
[Autenticação Provider]
    ↓
Session/Token criado
    ↓
Armazenado em [Cookie|Session|JWT]
    ↓
Request para endpoint protegido
    ↓
middleware.ts verifica sessão
    ↓
getUserFromRequest extrai user ID
    ↓
Endpoint processa como user autenticado
```

### Decisões Arquiteturais Pendentes

| Decisão | Opções | Vantagens | Desvantagens |
|---------|--------|-----------|----------------|
| **Mecanismo** | NextAuth | Integrado com Next.js | Dependência adicional |
| | JWT Custom | Controle total | Mais código |
| | Supabase | Backend pronto | Lock-in vendor |
| **Storage** | Cookie | Seguro por padrão | CSRF protection needed |
| | LocalStorage | Flexível | Vulnerável a XSS |
| | Session | Servidor | Escalabilidade |
| **Provedor** | Credentials | Simples para MVP | Menos seguro |
| | OAuth (Google) | Padrão da indústria | Dependência externa |
| | Email Link | User-friendly | Mais complexo |

---

## 3. Implementação — Roadmap Faseado

### Fase 1: Setup (1-2 dias)
**Objetivo**: Estrutura base

- [ ] Decidir mecanismo de auth (NextAuth vs Custom vs Supabase)
- [ ] Instalar dependências necessárias
- [ ] Criar schema no banco (User sessions/tokens)
- [ ] Configurar variáveis de ambiente

**Arquivos**:
- `lib/auth.ts` — ✅ Stub pronto
- `app/middleware.ts` — TODO
- `.env.local` — TODO (auth secrets)

**Saída**: Endpoints ainda bloqueados, mas estrutura pronta

---

### Fase 2: Mecanismo de Auth (2-3 dias)
**Objetivo**: Implementar login/registro

**Para NextAuth**:
- [ ] Configurar `api/auth/[...nextauth].ts`
- [ ] Conectar a estratégia (Credentials/OAuth)
- [ ] Implementar banco de dados de usuários
- [ ] Testes de login/logout

**Para JWT Custom**:
- [ ] Implementar token generation
- [ ] Implementar token verification
- [ ] Configurar refresh tokens
- [ ] Implementar logout/token revocation

**Saída**: Login/registro funcional, endpoints ainda bloqueados

---

### Fase 3: Desbloqueio de Endpoints (1 dia)
**Objetivo**: Endpoints funcionam com auth

- [ ] Atualizar `lib/auth.ts` com implementação real
- [ ] Remover bloqueios de endpoints API
- [ ] Testar fluxo completo (login → upgrade → Stripe)
- [ ] Proteger rotas privadas (`/dashboard/*`)

**Arquivos**:
- `app/api/advogados/route.ts` — remover 401 block
- `app/api/dashboard/route.ts` — remover 401 block
- `app/api/stripe/upgrade/route.ts` — remover 401 block
- `app/middleware.ts` — redirecionar não-autenticados

**Saída**: Sistema autenticado funcional

---

### Fase 4: Segurança & Testes (1-2 dias)
**Objetivo**: Validar implementação

- [ ] Testes de segurança (CSRF, XSS, etc)
- [ ] Rate limiting em endpoints de auth
- [ ] Validação de senhas (força, hash)
- [ ] Testes E2E de fluxos críticos

**Saída**: Pronto para produção

---

## 4. Requisitos de Implementação

### Banco de Dados
```sql
-- User sessions/tokens (NextAuth style)
CREATE TABLE Session {
  id: String @id
  sessionToken: String @unique
  userId: String
  expires: DateTime
  user: User
}

-- OAuth accounts (if using OAuth)
CREATE TABLE Account {
  id: String @id
  userId: String
  type: String
  provider: String
  providerAccountId: String
  refresh_token: String?
  access_token: String?
  expires_at: Int?
  token_type: String?
  scope: String?
  id_token: String?
  session_state: String?
}
```

### Variáveis de Ambiente
```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# OAuth (if using)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# JWT (if using custom)
JWT_SECRET=your-jwt-secret
JWT_EXPIRY=24h
```

### Dependências Sugeridas
```json
{
  "next-auth": "^4.x or ^5.x",
  "bcryptjs": "^2.4.3",
  "@prisma/client": "^5.x"
}
```

---

## 5. Riscos e Mitigação

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| **Escolha errada de auth** | Alto | Decisão arquitetural de sprint 0 |
| **Segurança inadequada** | Crítico | Code review + security audit |
| **Performance degradação** | Médio | Testes de carga |
| **CORS/Session issues** | Médio | Testes manuais em dev/prod |
| **Data loss na migração** | Alto | Backup antes de implementação |

---

## 6. Critérios de Sucesso

**Fase 1**: ✅
- [ ] `lib/auth.ts` stub criado e documentado
- [ ] Documentação de decisões arquiteturais
- [ ] Plano faseado em lugar

**Fase 2**: TODO
- [ ] Login/registro funcional
- [ ] Usuários persistidos no banco
- [ ] Session/token gerenciado corretamente

**Fase 3**: TODO
- [ ] `/api/advogados` POST funciona com auth
- [ ] `/api/dashboard` GET retorna dados de usuário
- [ ] `/api/stripe/upgrade` cria checkout com email real
- [ ] Rotas privadas redirecionam não-autenticados

**Fase 4**: TODO
- [ ] Todos os testes passam
- [ ] Não há vulnerabilidades conhecidas
- [ ] Performance aceitável (< 200ms auth latency)

---

## 7. Timeline Estimada

| Fase | Duração | Status |
|------|---------|--------|
| **Fase 1: Setup** | 1-2 dias | ✅ Parcialmente pronto |
| **Fase 2: Mecanismo** | 2-3 dias | ⏳ Aguardando decisão arquitetural |
| **Fase 3: Desbloqueio** | 1 dia | ⏳ Depende de Fase 2 |
| **Fase 4: Segurança** | 1-2 dias | ⏳ Depende de Fase 3 |
| **Total Estimado** | **5-8 dias** | ⏳ Aguardando go |

---

## 8. Decisões Recomendadas (Tech Lead)

Para `meuadvogado-us`, recomendo:

1. **Mecanismo**: NextAuth v5
   - ✅ Integrado com Next.js 15
   - ✅ Documentação excelente
   - ✅ Suporta Credentials + OAuth
   - ✅ Session gerenciado automaticamente

2. **Provedor Inicial**: Credentials (email + password)
   - MVP rápido
   - Migração fácil para OAuth depois

3. **Storage**: Cookies (NextAuth default)
   - Seguro
   - CSRF automático com NextAuth

4. **Database**: Usar schema Prisma existente
   - Expandir User model
   - Adicionar tables de Session/Account

---

## 9. Próximos Passos Imediatos

1. **Discussão arquitetural** (Tech Lead + Team)
   - Validar recomendação de NextAuth
   - Confirmar provedor de auth
   - Definir prazo

2. **Preparação** (Dev)
   - Criar branch `feature/authentication`
   - Instalar dependências
   - Criar migration de schema

3. **Implementação** (Dev)
   - Seguir Fase 1 → Fase 2 → Fase 3 → Fase 4
   - Pull requests e reviews para cada fase

---

## 10. Referências

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Next.js Middleware](https://nextjs.org/docs/advanced-features/middleware)
- [OWASP Authentication](https://owasp.org/www-community/attacks/authentication_cheat_sheet)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Criado por**: Engenheiro SaaS (Recovery Mode)
**Data**: 2026-01-05
**Status**: 📋 Pronto para review arquitetural
