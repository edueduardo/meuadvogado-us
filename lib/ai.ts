// lib/ai.ts
// Sistema de IA com Claude 3.5 Sonnet
// OTIMIZADO: 50% mais barato que OpenAI + melhor em tarefas jurídicas

import Anthropic from "@anthropic-ai/sdk";

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
}

// DISCLAIMER LEGAL OBRIGATÓRIO
export const LEGAL_DISCLAIMER = `
⚠️ AVISO LEGAL IMPORTANTE:

Esta análise é APENAS INFORMATIVA e NÃO constitui aconselhamento jurídico.
As informações fornecidas são baseadas em análise automatizada e podem conter
imprecisões. Para orientação jurídica específica sobre seu caso, você DEVE
consultar um advogado licenciado.

Ao usar este serviço, você reconhece que:
• Esta não é uma relação advogado-cliente
• Nenhuma informação aqui deve ser interpretada como conselho legal
• Você deve verificar todas as informações com um profissional licenciado
• Prazos e custos são estimativas e podem variar significativamente
`;

export interface CaseAnalysisResult {
  title: string;
  summary: string;
  suggestedArea: string;
  urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  complexity: "simple" | "medium" | "complex";
  keyIssues: string[];
  potentialChallenges: string[];
  recommendedActions: string[];
  estimatedCostMin: number | null;
  estimatedCostMax: number | null;
  estimatedTimeline: string | null;
  successProbability: number | null;
  tokensUsed: number;
  rawResponse?: string;
  disclaimer: string;
}

export interface AnalyzeCaseParams {
  description: string;
  practiceArea: string;
  additionalInfo?: Record<string, string>;
  clientCity?: string;
  clientState?: string;
}

export async function analyzeCase(params: AnalyzeCaseParams): Promise<CaseAnalysisResult> {
  const { description, practiceArea, additionalInfo, clientCity, clientState } = params;

  // PROMPT OTIMIZADO - Linguagem cuidadosa para evitar problemas legais
  const systemPrompt = `Você é um assistente de organização de informações jurídicas especializado em casos de brasileiros nos Estados Unidos.

IMPORTANTE - LIMITAÇÕES LEGAIS:
- Você NÃO é um advogado e NÃO pode dar aconselhamento jurídico
- Você apenas ORGANIZA e CATEGORIZA informações
- Use sempre linguagem como "pode ser relevante", "geralmente", "em casos similares"
- NUNCA use "você deve", "recomendamos fazer", "o melhor é"
- Sempre enfatize que o cliente PRECISA consultar um advogado licenciado

Sua função é:
1. Organizar as informações do caso de forma estruturada
2. Identificar possíveis áreas jurídicas relevantes
3. Listar questões que podem ser importantes
4. Fornecer estimativas gerais baseadas em casos similares
5. Sugerir perguntas que o cliente pode fazer ao advogado

Responda com um JSON válido contendo:
- title: Título descritivo do caso (máx 60 caracteres)
- summary: Resumo organizado em 2-3 frases
- suggestedArea: Área jurídica que parece mais relevante
- urgency: Nível de urgência aparente (LOW, MEDIUM, HIGH, CRITICAL)
- complexity: Complexidade estimada (simple, medium, complex)
- keyIssues: Array de 3-5 questões principais identificadas
- potentialChallenges: Array de possíveis complicações a considerar
- recommendedActions: Array de 3-5 perguntas/tópicos para discutir com advogado
- estimatedCostMin: Custo mínimo típico em dólares (ou null)
- estimatedCostMax: Custo máximo típico em dólares (ou null)
- estimatedTimeline: Prazo típico (ex: "3-6 meses", ou null)
- successProbability: Probabilidade geral em casos similares 0-100 (ou null)`;

  let userPrompt = `Organize as informações do seguinte caso jurídico de um brasileiro nos EUA:

ÁREA INDICADA: ${practiceArea}
${clientCity && clientState ? `LOCALIZAÇÃO: ${clientCity}, ${clientState}` : ""}

DESCRIÇÃO:
${description}`;

  if (additionalInfo && Object.keys(additionalInfo).length > 0) {
    userPrompt += "\n\nINFORMAÇÕES ADICIONAIS:";
    for (const [key, value] of Object.entries(additionalInfo)) {
      userPrompt += `\n- ${key}: ${value}`;
    }
  }

  userPrompt += "\n\nOrganize estas informações em formato JSON conforme especificado.";

  try {
    const anthropic = getAnthropicClient();
    
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: `${systemPrompt}\n\n${userPrompt}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Resposta inesperada da IA");
    }

    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

    // Parse JSON
    const parsed = JSON.parse(content.text);

    return {
      title: parsed.title || "Caso sem título",
      summary: parsed.summary || "Análise não disponível",
      suggestedArea: parsed.suggestedArea || practiceArea,
      urgency: parsed.urgency || "MEDIUM",
      complexity: parsed.complexity || "medium",
      keyIssues: Array.isArray(parsed.keyIssues) ? parsed.keyIssues : [],
      potentialChallenges: Array.isArray(parsed.potentialChallenges) ? parsed.potentialChallenges : [],
      recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : [],
      estimatedCostMin: parsed.estimatedCostMin || null,
      estimatedCostMax: parsed.estimatedCostMax || null,
      estimatedTimeline: parsed.estimatedTimeline || null,
      successProbability: parsed.successProbability || null,
      tokensUsed,
      rawResponse: content.text,
      disclaimer: LEGAL_DISCLAIMER,
    };
  } catch (error: unknown) {
    console.error("Anthropic API error:", error);
    const err = error as { status?: number; message?: string };
    
    if (err?.status === 401) {
      throw new Error("Chave de API inválida");
    }
    if (err?.status === 429) {
      throw new Error("Limite de requisições excedido. Tente novamente.");
    }
    
    throw new Error(err?.message || "Falha ao analisar caso");
  }
}

// Função para chat com IA (para advogados)
export async function chatWithAI(
  message: string,
  context?: string
): Promise<string> {
  const anthropic = getAnthropicClient();

  const systemPrompt = `Você é um assistente de pesquisa jurídica para advogados de imigração.
Você pode ajudar com:
- Pesquisa de leis e regulamentos
- Prazos e procedimentos
- Precedentes e casos similares
- Interpretação de políticas do USCIS

IMPORTANTE: Você está auxiliando um advogado licenciado, não um cliente.
Forneça informações técnicas e cite fontes quando possível.`;

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: context
          ? `${systemPrompt}\n\nContexto: ${context}\n\nPergunta: ${message}`
          : `${systemPrompt}\n\nPergunta: ${message}`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Resposta inesperada da IA");
  }

  return content.text;
}
