# RESET PROTOCOL — EXECUÇÃO CONTROLADA

**Projeto**: meuadvogado-us (SaaS - Diretório de Advogados Brasileiros nos EUA)

## PRINCÍPIO FUNDAMENTAL

Nada é considerado verdadeiro até ser comprovado no código.
Memória, suposições e respostas de IA não têm valor sem evidência.

---

## OBJETIVO DO RESET

- ✗ Recuperar confiança no estado do sistema
- ✗ Eliminar inconsistências críticas
- ✗ Restaurar build estável
- ✗ Criar base segura para evolução futura

---

## REGRAS ABSOLUTAS

1. **Nenhuma feature nova** durante o RESET
2. **Nenhuma otimização estética**
3. **Nenhum refactor amplo**
4. Uma alteração por vez
5. Toda alteração exige **build + lint + commit**
6. IA é executora, nunca decisora
7. Nada é "feito" sem evidência

---

## ESTADO ATUAL DO RESET

- Data de início: 2026-01-05
- Responsável: Engenheiro SaaS (Recovery Mode)
- Status: **AUDITORIA EM ANDAMENTO**
- Checkpoint: ETAPA 2 - AUDITORIA CONCLUÍDA

---

## FASES DO RESET

1. **ETAPA 1 – ESTADO DA VERDADE** ✓ COMPLETA
   - Mapeamento de rotas públicas/privadas
   - Integrações externas identificadas
   - Variáveis de ambiente documentadas
   - Padrões e exceções catalogadas

2. **ETAPA 2 – AUDITORIA DE INCONSISTÊNCIAS** ✓ COMPLETA
   - Divergências código/docs encontradas
   - Rotas incompletas documentadas
   - Código morto identificado
   - Middleware ausente confirmado
   - TODOs problemáticos catalogados

3. **ETAPA 3 – PLANO DE ESTABILIZAÇÃO** → PRÓXIMA
   - Lista numerada de correções MÍNIMAS
   - Sem implementação

4. **ETAPA 4 – IMPLEMENTAÇÃO CONTROLADA** → BLOQUEADA
   - Somente após aprovação do PLANO
   - Um item por vez
   - Build obrigatório após cada item

---

## CRITÉRIO DE CONCLUSÃO

O RESET termina quando:
- ✓ EXECUTION_CHECKLIST estiver 100% completo
- ✓ STATE_OF_TRUTH estiver validado e assinado
- ✓ Nenhuma divergência conhecida no sistema
- ✓ Build passa sem warnings críticos
- ✓ Todas as rotas têm proteção adequada

**Hoje**: Nenhum desses critérios é verdadeiro.

---

## COMANDO DE AVANÇO

```bash
# Proceder para ETAPA 3 somente após:
# 1. Revisar STATE_OF_TRUTH.md
# 2. Validar AUDITORIA em ETAPA 2
# 3. Executar: npm run build (com sucesso)
```

**FRASES PROIBIDAS**:
- "está feito"
- "deve estar funcionando"
- "supostamente"
- "acho que"
- "parece estar"

**FRASES OBRIGATÓRIAS**:
- "Confirmado em [arquivo:linha]"
- "Build passou: [timestamp]"
- "Lint passou: [timestamp]"
- "Arquivo modificado: [list]"
