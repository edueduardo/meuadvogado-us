# ETAPA 3 — PLANO DE ESTABILIZAÇÃO

**Data**: 2026-01-05
**Responsável**: Engenheiro SaaS (Recovery Mode)
**Status**: 📋 PLANEJAMENTO (SEM IMPLEMENTAÇÃO)

---

## PRINCÍPIO DO PLANO

1. **Correções MÍNIMAS**: Apenas o necessário para estabilidade
2. **Independentes**: Cada item pode ser feito isoladamente
3. **Verificáveis**: Cada item tem critério de sucesso (build/test)
4. **Ordenadas**: Dependências respeitadas
5. **Uma por vez**: Sem execução até aprovação explícita

---

## LISTA DE CORREÇÕES (MÍNIMAS)

### ITEM #1 — Remover código morto (Priority: BAIXA)

**Descrição**: Remover `/lib/i18n.ts` (206 linhas não utilizadas)

**Por quê**:
- Zero imports em todo o projeto
- Conflita com next-intl
- Polui bundle

**Arquivos afetados**:
- `lib/i18n.ts` — DELETAR

**Critério de sucesso**:
- [ ] Arquivo deletado
- [ ] Build passa
- [ ] Nenhuma quebra

**Dependências**: Nenhuma

**Verificação**:
```bash
npm run build
grep -r "from.*lib/i18n" --include="*.ts" --include="*.tsx"  # deve retornar zero
```

**Risco**: MUITO BAIXO (código morto)

---

### ITEM #2 — Remover dependências fantasma (Priority: BAIXA)

**Descrição**: Remover imports não utilizadas de `package.json`:
- @supabase/supabase-js (não usado)
- resend (não usado)
- next-intl (não usado, conflita com código local)

**Por quê**:
- ~2.5 MB de bloat
- Sem função no projeto
- Confundem futuros devs

**Arquivos afetados**:
- `package.json` — remover 3 linhas

**Critério de sucesso**:
- [ ] package.json sem as 3 dependências
- [ ] npm install passa
- [ ] Build passa
- [ ] Tamanho bundle reduzido (~2.5MB)

**Dependências**: Precisa vir após ITEM #1

**Verificação**:
```bash
npm install
npm run build
ls -lah .next/
grep -r "@supabase\|resend\|next-intl" app/ lib/ --include="*.ts" --include="*.tsx"  # zero
```

**Risco**: MUITO BAIXO (remover não usados)

---

### ITEM #3 — Corrigir config ESLint (Priority: MÉDIA)

**Descrição**: Resolver incompatibilidade ESLint 8 vs config ESLint 9

**Opções**:
- A) Downgrade eslint-config-next de 15.2.4 para versão compatível com ESLint 8
- B) Atualizar ESLint para 9+
- C) Reescrever eslint.config.mjs para sintaxe ESLint 8

**Proposta**: Opção C (menos breaking)

**Arquivos afetados**:
- `eslint.config.mjs` — reescrever

**Critério de sucesso**:
- [ ] `npm run lint` passa sem erros
- [ ] `npm run build` continua passando
- [ ] Nenhuma rule crítica perdida

**Dependências**: Nenhuma

**Verificação**:
```bash
npm run lint
npm run build
```

**Risco**: MÉDIO (pode quebrar CI/CD)

---

### ITEM #4 — Remover Google Fonts hardcoded (Priority: MÉDIA)

**Descrição**: Consolidar remoção de Google Fonts em `/app/layout.tsx` (já foi feito para build passar, agora documentar)

**Por quê**:
- Build falha sem rede externa
- Já removido, mas sem documentação
- Precisamos de fallback de fonts local

**Arquivos afetados**:
- `app/layout.tsx` — JÁ MODIFICADO (manter assim)
- `globals.css` — verificar se há @import de Google Fonts

**Critério de sucesso**:
- [ ] Build passa sem dependência de rede
- [ ] Fonts ainda aparecem corretamente (fallback system fonts)
- [ ] globals.css sem @import google

**Dependências**: Nenhuma

**Verificação**:
```bash
npm run build  # deve passar sem network
grep -i "fonts.googleapis" app/ lib/ --include="*.ts" --include="*.tsx" --include="*.css"  # zero
```

**Risco**: MUITO BAIXO (cosmético)

---

### ITEM #5 — Remover hardcodes de TEMP USER ID (Priority: CRÍTICA)

**Descrição**: Remover todos os `'temp-user-id'` e substituir por chamadas reais ao contexto autenticado

**Locais**:
1. `/app/api/dashboard/route.ts:7` — `const userId = 'temp-user-id';`
2. `/app/api/advogados/route.ts:85` — `userId: 'temp-user-id',`

**Por quê**:
- CRÍTICO: Todos veem os mesmos dados
- Inviabiliza qualquer fluxo real
- Violação de segurança/privacidade

**Arquivos afetados**:
- `app/api/dashboard/route.ts` — remover linha ou substituir
- `app/api/advogados/route.ts` — remover linha ou substituir

**Critério de sucesso**:
- [ ] Nenhuma ocorrência de 'temp-user-id' em código production
- [ ] Build passa
- [ ] Documentar como será extraído userId (aguardar autenticação)

**Dependências**: Após implementação de autenticação (ou marcar como // TODO)

**Verificação**:
```bash
grep -r "temp-user-id" app/ lib/ --include="*.ts" --include="*.tsx"  # zero
npm run build
```

**Risco**: ALTO (afeta data layer)

---

### ITEM #6 — Remover hardcodes de EMAIL/USER-ID no Stripe (Priority: CRÍTICA)

**Descrição**: Remover emails e IDs fake do checkout Stripe

**Locais**:
1. `/app/api/stripe/upgrade/route.ts:38` — `customer_email: 'user@example.com',`
2. `/app/api/stripe/upgrade/route.ts:39` — `client_reference_id: 'user-id',`

**Por quê**:
- CRÍTICO: Checkout não funciona sem dados reais
- Impossível processar pagamentos
- IDs incorretos no Stripe

**Arquivos afetados**:
- `app/api/stripe/upgrade/route.ts` — linhas 38-39

**Critério de sucesso**:
- [ ] Nenhum hardcode de email/user-id em checkout
- [ ] Build passa
- [ ] Documentar como será extraído user autenticado

**Dependências**: Autenticação precisa estar implementada

**Verificação**:
```bash
grep -r "user@example.com\|client_reference_id: 'user-id'" app/ lib/  # zero
npm run build
```

**Risco**: ALTO (bloqueia Stripe)

---

### ITEM #7 — Atualizar Stripe Price IDs (Priority: CRÍTICA)

**Descrição**: Substituir placeholder price IDs por valores reais de Stripe

**Locais**:
1. `/lib/plans.ts:21` — `stripePriceId: 'price_1Oxxxx', // Atualizar`
2. `/lib/plans.ts:40` — `stripePriceId: 'price_1Oxxxx', // Atualizar`

**Por quê**:
- Comentário "// Atualizar" indica não finalizado
- Price IDs fake causam erro no checkout
- Sem isso, upgrade para premium falha

**Arquivos afetados**:
- `lib/plans.ts` — linhas 21, 40

**Ação**:
- Consultar Stripe dashboard (account.stripe.com)
- Obter price IDs reais para PREMIUM e FEATURED
- Atualizar valores em `lib/plans.ts`

**Critério de sucesso**:
- [ ] Nenhum placeholder `price_1Oxxxx` em código
- [ ] Nenhum comment `// Atualizar`
- [ ] Price IDs começam com `price_` e são válidos
- [ ] Build passa

**Dependências**: Precisa de acesso Stripe Admin

**Verificação**:
```bash
grep -r "price_1Oxxxx\|// Atualizar" lib/  # zero
npm run build
```

**Risco**: MÉDIO (depende de dados externos)

---

### ITEM #8 — Remover TODO comments (Priority: MÉDIA)

**Descrição**: Documentar ou remover 12 TODOs dispersos no código

**Locais** (consolidar):
- `app/login/page.tsx:25` — TODO: Implementar autenticação
- `app/cadastro/page.tsx:70` — TODO: Implementar cadastro
- `app/dashboard/page.tsx:46` — TODO: Implementar API real
- `app/dashboard/analytics/page.tsx:43` — TODO: Implementar API real
- `app/dashboard/perfil/page.tsx:74` — TODO: Implementar API real
- `app/dashboard/perfil/page.tsx:132` — TODO: Implementar API real
- `app/api/dashboard/route.ts:6` — TODO: Implementar autenticação e pegar ID do usuário logado
- `app/api/dashboard/route.ts:61` — TODO: Implementar sistema de views
- `app/api/advogados/route.ts:80` — TODO: Implementar autenticação depois
- `app/api/advogados/route.ts:85` — TODO: Usar ID do usuário autenticado
- `app/api/stripe/upgrade/route.ts:38` — TODO: Pegar email do usuário logado
- `app/api/stripe/upgrade/route.ts:39` — TODO: Pegar ID do usuário logado

**Por quê**:
- TODOs são sinais de código incompleto
- Violam "confiabilidade do sistema"
- Precisam ser implementados ou removidos

**Ação**:
- Se pode ser implementado → implementar
- Se espera por outra feature → converter em comentário claro
- Se nunca será feito → remover

**Arquivos afetados**: 7 arquivos

**Critério de sucesso**:
- [ ] Nenhum `// TODO` em código production
- [ ] Build passa
- [ ] Lint passa

**Dependências**: Alguns dependem de autenticação (ITEM #9)

**Verificação**:
```bash
grep -r "TODO:" app/ lib/ --include="*.ts" --include="*.tsx"  # zero
npm run build
```

**Risco**: ALTO (afeta múltiplos arquivos)

---

### ITEM #9 — Implementar contexto de autenticação mínimo (Priority: CRÍTICA)

**Descrição**: Criar mecanismo para extrair usuário autenticado em endpoints

**Escopo MÍNIMO**:
- Criar função `getUserFromRequest(req)` que retorna user ID
- Ou: Criar middleware que adiciona user ao request context
- NÃO implementar login/register ainda (apenas plumbing)

**Arquivos a criar/modificar**:
- `lib/auth.ts` — nova função de extração de user
- `app/middleware.ts` — proteger rotas
- `app/api/dashboard/route.ts` — usar getUserFromRequest
- `app/api/advogados/route.ts` — usar getUserFromRequest
- `app/api/stripe/upgrade/route.ts` — usar getUserFromRequest

**Critério de sucesso**:
- [ ] Função `getUserFromRequest` criada
- [ ] Endpoints usam função real (não temp-user-id)
- [ ] Build passa
- [ ] Lint passa
- [ ] Erro 401 se user não autenticado

**Dependências**: Precisa de ITEM #5, #6 completos

**Verificação**:
```bash
grep -r "temp-user-id\|user@example.com" app/ lib/  # zero
npm run build
# Teste manual: curl /api/dashboard sem auth → 401
```

**Risco**: ALTO (redesenha fluxo)

---

### ITEM #10 — Documentar estado de autenticação (Priority: BAIXA)

**Descrição**: Criar arquivo `docs/AUTH_STATUS.md` explicando:
- Qual mecanismo de auth será usado (NextAuth? Custom? Supabase?)
- Como está implementado hoje
- Roadmap para completar

**Arquivos a criar**:
- `docs/AUTH_STATUS.md`

**Critério de sucesso**:
- [ ] Arquivo criado
- [ ] Descreve estado atual
- [ ] Descreve próximas etapas

**Dependências**: Nenhuma (paralelo)

**Verificação**:
```bash
test -f docs/AUTH_STATUS.md
```

**Risco**: MUITO BAIXO (documentação)

---

## ORDEM DE EXECUÇÃO RECOMENDADA

**Fase 1 — Limpeza (sem breaking)**:
1. ITEM #1 — Remover i18n.ts
2. ITEM #2 — Remover deps fantasma
3. ITEM #4 — Verificar fonts

**Fase 2 — Infraestrutura (pode quebrar)**:
3. ITEM #3 — Corrigir ESLint
4. ITEM #9 — Implementar auth context

**Fase 3 — Remoção de hardcodes**:
5. ITEM #5 — Remover temp-user-id
6. ITEM #6 — Remover hardcoded email
7. ITEM #7 — Atualizar Stripe prices
8. ITEM #8 — Remover TODOs

**Fase 4 — Documentação**:
9. ITEM #10 — Documentar auth status

---

## CRITÉRIOS DE PARADA

**Parar a execução se**:
- Build não passar após qualquer mudança
- Nova falha for descoberta (criar novo item)
- Teste manual revelar problema (reverter item)

**Revalidar checklist após cada item**:
```bash
npm run build
npm run lint  # após ITEM #3
```

---

## ESTIMATIVA DE MODIFICAÇÕES

| Item | Arquivos | Linhas | Complexidade |
|------|----------|--------|--------------|
| #1 | 1 | 206 (delete) | Trivial |
| #2 | 1 | 3 (remove) | Trivial |
| #3 | 1 | 18 (rewrite) | Médio |
| #4 | 1 | 0 (já feito) | Done |
| #5 | 2 | 2 (remove) | Trivial |
| #6 | 1 | 2 (remove) | Trivial |
| #7 | 1 | 2 (update) | Trivial |
| #8 | 7 | 12 (remove) | Trivial |
| #9 | 5 | 50 (novo) | Alto |
| #10 | 1 | 30 (novo) | Trivial |
| **TOTAL** | **23** | **~325** | **Médio** |

---

## PRÓXIMA AÇÃO

**Status Atual**: Plano concluído, aguardando aprovação

**Antes de começar ITEM #1**:
1. [ ] Revisar este plano
2. [ ] Ajustar ordem se necessário
3. [ ] Obter aprovação explícita (assinatura)
4. [ ] Configurar git branch: `claude/recover-saas-project-NJ92f`

**Comando para começar**:
```bash
# (após aprovação)
git checkout claude/recover-saas-project-NJ92f
git pull origin claude/recover-saas-project-NJ92f
# Proceder para ITEM #1
```

---

## ASSINATURA DE APROVAÇÃO

Engenheiro Responsável: _______________________
Data de Aprovação: ______________
Timestamp: ______________

**Observações do Revisor**:
```

```

---

**Fim do Plano. Aguardando aprovação para proceder.**
