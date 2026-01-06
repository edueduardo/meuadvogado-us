# EXECUTION CHECKLIST — CRITÉRIO DE VERDADE

**Projeto**: meuadvogado-us
**Status Geral**: 🔴 **NÃO ESTÁVEL** (muitos itens desmarcados)
**Data**: 2026-01-05
**Revisor**: Aguardando assinatura

---

## BLOQUEADORES ATUAIS

Se qualquer item desta seção estiver **desmarcado**, o sistema **NÃO** pode avançar.

### BUILD & QUALIDADE

- [x] Build passa (`npm run build`)
  - **Evidência**: `✓ Compiled successfully in 8.4s` (2026-01-05)
  - **Modificação**: Removido Google Fonts import de `/app/layout.tsx`
  - **Status**: ✓ OK, reproduzível

- [ ] Lint passa (`npm run lint`)
  - **Status**: ✗ FALHA
  - **Razão**: ESLint 8.57.1 incompatível com eslint.config.mjs (sintaxe ESLint 9)
  - **Ação Necessária**: Corrigir configuração ESLint ou downgrade de config
  - **Bloqueador**: SIM, mas não de código, de configuração

- [ ] Sem erros silenciosos
  - **Status**: ✗ VERIFICAR
  - **Problemas Conhecidos**:
    - TODOs em 12 locais (ver STATE_OF_TRUTH.md)
    - Hardcoded temp-user-id em 2 endpoints
    - Hardcoded email em checkout Stripe
  - **Ação Necessária**: Todos precisam ser corrigidos

- [ ] Sem warnings ignorados
  - **Status**: ✗ VERIFICAR
  - **Warnings Conhecidos**:
    - ESLint deprecated com version 8.57.1
    - Dependências não utilizadas (supabase, resend, next-intl)
  - **Ação Necessária**: Investigar

---

### SEGURANÇA MÍNIMA

- [ ] Middleware de autenticação implementado
  - **Status**: ✗ NÃO EXISTE
  - **Evidência**: Nenhum arquivo `middleware.ts`
  - **Ação Necessária**: Criar e ativar
  - **Bloqueador**: SIM, CRÍTICO

- [ ] Rotas privadas protegidas
  - **Status**: ✗ SEM PROTEÇÃO
  - **Rotas Afetadas**: `/dashboard/*` (3 rotas)
  - **Evidência**: Acessíveis sem login
  - **Ação Necessária**: Adicionar middleware check

- [ ] Endpoints privados autenticados
  - **Status**: ✗ SEM AUTENTICAÇÃO
  - **Endpoints Afetados**:
    - POST `/api/advogados`
    - GET `/api/dashboard`
    - POST `/api/stripe/upgrade`
  - **Evidência**: Comentários `// TODO: implementar auth`
  - **Ação Necessária**: Verificar user em cada endpoint

- [ ] Nenhum hardcode de user/email crítico
  - **Status**: ✗ HARDCODED ENCONTRADO
  - **Locais**:
    - `temp-user-id` em 2 arquivos
    - `user@example.com` em `/api/stripe/upgrade`
    - `user-id` em `/api/stripe/upgrade`
  - **Ação Necessária**: Remover todos

- [ ] Stripe webhook validado
  - **Status**: ✓ OK
  - **Confirmado em**: `/app/api/stripe/webhook/route.ts` linhas 42-56
  - **Observação**: Única exceção de segurança que passa

- [ ] Database credentials em ENV
  - **Status**: ✓ OK
  - **Confirmado em**: `DATABASE_URL` em prisma/schema.prisma

- [ ] API keys em ENV
  - **Status**: ✓ PARCIAL
  - **Criticas em ENV**:
    - STRIPE_SECRET_KEY ✓
    - STRIPE_WEBHOOK_SECRET ✓
    - ANTHROPIC_API_KEY ✓
    - DATABASE_URL ✓
  - **Hardcoded (incorreto)**:
    - STRIPE_API_VERSION ✗
    - ANTHROPIC_MODEL ✗

---

### CONSISTÊNCIA DE CÓDIGO

- [ ] Nenhum hardcode crítico
  - **Status**: ✗ ENCONTRADO
  - **Itens**:
    - temp-user-id (2)
    - user@example.com (1)
    - 'price_1Oxxxx' (2)
    - claude-3-sonnet-20240229 (1)
    - '2023-10-16' (Stripe version)
  - **Total**: 7 hardcodes críticos

- [ ] Rotas protegidas corretamente
  - **Status**: ✗ NÃO
  - **Dashboard não tem middleware check**
  - **APIs não validam user**

- [ ] Variáveis via ENV
  - **Status**: ✓ PARCIAL
  - **Corretas**: DATABASE_URL, STRIPE_SECRET_KEY, ANTHROPIC_API_KEY
  - **Não em ENV**: Model AI, Stripe API version

- [ ] Imports e código mortos removidos
  - **Status**: ✗ NÃO
  - **Código Morto**:
    - `/lib/i18n.ts` (206 linhas, zero imports)
  - **Imports Não Usados**:
    - @supabase/supabase-js
    - resend
    - next-intl
  - **Ação Necessária**: Remover

- [ ] Nenhuma funcionalidade quebrada
  - **Status**: ✗ QUEBRADA
  - **Formulários**:
    - `/login` - TODO não implementado
    - `/cadastro` - TODO não implementado
    - `/caso` - sem backend
  - **Dashboard**:
    - Sem dados reais
    - Sem autenticação
    - Usa data fake

- [ ] Toda feature tem origem/destino claro
  - **Status**: ✗ CONFUSO
  - **Exemplo**: `/caso` page existe mas endpoint `/api/caso` não faz nada real

---

### DOCUMENTAÇÃO

- [x] STATE_OF_TRUTH atualizado
  - **Status**: ✓ CONCLUÍDO
  - **Arquivo**: `/docs/STATE_OF_TRUTH.md`

- [x] RESET_PROTOCOL definido
  - **Status**: ✓ CONCLUÍDO
  - **Arquivo**: `/docs/RESET_PROTOCOL.md`

- [ ] NENHUMA promessa futura ("será implementado", "em breve")
  - **Status**: ✗ VIOLADO
  - **Exemplos**:
    - 12 TODOs no código
    - Comments "// Atualizar" em prices
  - **Ação Necessária**: Remover TODOs ou implementar

- [ ] NENHUMA divergência conhecida entre docs e código
  - **Status**: ✗ ENCONTRADAS
  - **Divergências**:
    - Supabase documentado vs não usado
    - Autenticação "implementada" vs não funciona
    - Checkout "integrado" vs sem user

---

### VALIDAÇÃO MANUAL

- [ ] Login flow testado
  - **Status**: ✗ NÃO TESTADO
  - **Bloqueio**: Formulário tem `// TODO`
  - **Ação**: Fazer login real

- [ ] Dashboard acessível após login
  - **Status**: ✗ NÃO VERIFICADO
  - **Bloqueio**: Sem middleware
  - **Ação**: Testar com user autenticado

- [ ] Criar advogado (requer login)
  - **Status**: ✗ NÃO TESTADO
  - **Bloqueio**: Sem auth no endpoint
  - **Ação**: Testar com auth

- [ ] Upgrade para premium
  - **Status**: ✗ NÃO TESTADO
  - **Bloqueio**: Hardcoded prices, sem user
  - **Ação**: Testar com user real

- [ ] Webhook Stripe funcionando
  - **Status**: ✓ CÓDIGO OK
  - **Não Testado**: Integração real com Stripe

---

## SUMÁRIO POR SEVERIDADE

### 🔴 CRÍTICO (Bloqueia Sistema)

| Item | Contagem | Status |
|------|----------|--------|
| Sem Autenticação Global | 1 | ✗ |
| Endpoints Privados Expostos | 3 | ✗ |
| Hardcoded User/Email | 3 | ✗ |
| Middleware Ausente | 1 | ✗ |
| **TOTAL CRÍTICO** | **8** | ✗ |

---

### 🟡 ALTO (Impede Uso)

| Item | Contagem | Status |
|------|----------|--------|
| Formulários não Funcionam | 2 | ✗ |
| TODOs no Código | 12 | ✗ |
| Preços Stripe Inválidos | 2 | ✗ |
| ESLint Config Quebrada | 1 | ✗ |
| **TOTAL ALTO** | **17** | ✗ |

---

### 🟢 MÉDIO (Qualidade)

| Item | Contagem | Status |
|------|----------|--------|
| Código Morto | 1 arquivo | ✗ |
| Deps Não Usadas | 3 | ✗ |
| Hardcodes Config | 2 | ✗ |
| **TOTAL MÉDIO** | **6** | ✗ |

---

## REGRA FINAL

### ❌ SISTEMA NÃO ESTÁ ESTÁVEL

**Checklist de Bloqueio**:
- Build passa: ✓ Sim (após mod)
- Lint passa: ✗ **Não** (config issue)
- Sem errors: ✗ **Não** (12 TODOs + 7 hardcodes)
- Segurança: ✗ **Não** (sem auth)
- Features funcionam: ✗ **Não** (login/cadastro broken)

**Conclusão**: 🔴 **BLOQUEADO PARA DESENVOLVIMENTO**

---

## PRÓXIMA AÇÃO

**Apenas após este checklist estar ✓ completo**:

1. Ir para `docs/ETAPA_3_PLANO.md`
2. Implementar correções na ordem especificada
3. Revalidar checklist após cada correção
4. Marcar items como ✓ quando realmente completos

**NÃO AVANÇAR ATÉ ASSINATURA**:

Engenheiro Responsável: _______________________
Data: ______________
Timestamp Build Último: ______________
Commit de Referência: ______________
