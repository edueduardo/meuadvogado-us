// lib/ai/claude-service.ts
// Integração com Claude (Anthropic) para AI Matching e Análise de Casos

import Anthropic from '@anthropic-ai/sdk';

// API Key (deixar vazio para configurar depois)
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

// Verificar se está configurado
export const isClaudeConfigured = () => !!ANTHROPIC_API_KEY;

// Cliente Anthropic
const anthropic = ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: ANTHROPIC_API_KEY })
  : null;

// Áreas jurídicas disponíveis
export const PRACTICE_AREAS = [
  { id: 'immigration', name: 'Imigração', keywords: ['green card', 'visto', 'deportação', 'cidadania', 'asilo', 'daca', 'uscis'] },
  { id: 'personal-injury', name: 'Acidentes Pessoais', keywords: ['acidente', 'lesão', 'indenização', 'seguro', 'trabalho', 'carro'] },
  { id: 'family', name: 'Família', keywords: ['divórcio', 'custódia', 'pensão', 'casamento', 'adoção', 'guarda'] },
  { id: 'criminal', name: 'Criminal', keywords: ['dui', 'prisão', 'crime', 'defesa', 'fiança', 'acusação', 'polícia'] },
  { id: 'business', name: 'Empresarial', keywords: ['empresa', 'llc', 'contrato', 'negócio', 'sócio', 'abertura'] },
  { id: 'real-estate', name: 'Imobiliário', keywords: ['imóvel', 'casa', 'compra', 'venda', 'aluguel', 'hipoteca'] },
  { id: 'employment', name: 'Trabalhista', keywords: ['emprego', 'demissão', 'salário', 'discriminação', 'assédio'] },
  { id: 'bankruptcy', name: 'Falência', keywords: ['dívida', 'falência', 'credor', 'chapter 7', 'chapter 13'] },
];

// Interface para análise de caso
export interface CaseAnalysis {
  practiceArea: string;
  practiceAreaName: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  summary: string;
  keyPoints: string[];
  estimatedComplexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX';
  suggestedQuestions: string[];
  legalConsiderations: string[];
}

// Interface para matching
export interface LawyerMatch {
  lawyerId: string;
  score: number;
  reasons: string[];
}

// Serviço Claude
export const claudeService = {
  isConfigured: () => isClaudeConfigured(),

  // Analisar caso e identificar área jurídica
  async analyzeCase(caseDescription: string): Promise<CaseAnalysis | null> {
    if (!anthropic) {
      console.warn('⚠️ Claude não configurado - usando análise básica');
      return this.basicCaseAnalysis(caseDescription);
    }

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        system: `Você é um assistente jurídico especializado em ajudar brasileiros nos Estados Unidos.
Analise o caso descrito e retorne APENAS um JSON válido com a seguinte estrutura:
{
  "practiceArea": "id da área (immigration, personal-injury, family, criminal, business, real-estate, employment, bankruptcy)",
  "practiceAreaName": "nome da área em português",
  "urgency": "LOW, MEDIUM, HIGH ou URGENT",
  "summary": "resumo do caso em 2-3 frases",
  "keyPoints": ["ponto 1", "ponto 2", "ponto 3"],
  "estimatedComplexity": "SIMPLE, MODERATE ou COMPLEX",
  "suggestedQuestions": ["pergunta 1 para o advogado", "pergunta 2"],
  "legalConsiderations": ["consideração legal 1", "consideração 2"]
}
Responda APENAS com o JSON, sem texto adicional.`,
        messages: [
          {
            role: 'user',
            content: `Analise este caso jurídico de um brasileiro nos EUA:\n\n${caseDescription}`,
          },
        ],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      
      // Extrair JSON da resposta
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Resposta não contém JSON válido');
      }

      const analysis = JSON.parse(jsonMatch[0]) as CaseAnalysis;
      return analysis;

    } catch (error) {
      console.error('Erro ao analisar caso com Claude:', error);
      return this.basicCaseAnalysis(caseDescription);
    }
  },

  // Análise básica (fallback quando Claude não está configurado)
  basicCaseAnalysis(caseDescription: string): CaseAnalysis {
    const lowerDesc = caseDescription.toLowerCase();
    
    // Identificar área por keywords
    let detectedArea = PRACTICE_AREAS[0]; // default: immigration
    let maxMatches = 0;
    
    for (const area of PRACTICE_AREAS) {
      const matches = area.keywords.filter(kw => lowerDesc.includes(kw)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedArea = area;
      }
    }

    // Detectar urgência
    let urgency: CaseAnalysis['urgency'] = 'MEDIUM';
    if (lowerDesc.includes('urgente') || lowerDesc.includes('emergência') || lowerDesc.includes('deportação')) {
      urgency = 'URGENT';
    } else if (lowerDesc.includes('prazo') || lowerDesc.includes('rápido')) {
      urgency = 'HIGH';
    }

    return {
      practiceArea: detectedArea.id,
      practiceAreaName: detectedArea.name,
      urgency,
      summary: caseDescription.substring(0, 200) + (caseDescription.length > 200 ? '...' : ''),
      keyPoints: ['Análise detalhada será feita pelo advogado'],
      estimatedComplexity: 'MODERATE',
      suggestedQuestions: [
        'Qual é o prazo para resolver esta situação?',
        'Quais documentos você vai precisar?',
        'Qual é a estimativa de custos?',
      ],
      legalConsiderations: ['Consulte um advogado licenciado para orientação específica'],
    };
  },

  // Fazer matching de advogados para um caso
  async matchLawyers({
    caseAnalysis,
    lawyers,
    clientLocation,
  }: {
    caseAnalysis: CaseAnalysis;
    lawyers: Array<{
      id: string;
      name: string;
      practiceAreas: string[];
      states: string[];
      rating: number;
      reviewCount: number;
      yearsExperience: number;
      languages: string[];
      verified: boolean;
      plan: string;
    }>;
    clientLocation: string;
  }): Promise<LawyerMatch[]> {
    
    // Filtrar advogados pela área de prática
    const relevantLawyers = lawyers.filter(lawyer => 
      lawyer.practiceAreas.some(area => 
        area.toLowerCase().includes(caseAnalysis.practiceArea) ||
        caseAnalysis.practiceArea.includes(area.toLowerCase())
      )
    );

    if (!anthropic || relevantLawyers.length === 0) {
      // Fallback: scoring básico
      return this.basicMatching(relevantLawyers.length > 0 ? relevantLawyers : lawyers, caseAnalysis, clientLocation);
    }

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        system: `Você é um sistema de matching que conecta clientes a advogados.
Analise os advogados disponíveis e o caso, retornando os 5 melhores matches.
Retorne APENAS um JSON válido com array de matches:
[
  {"lawyerId": "id", "score": 0-100, "reasons": ["razão 1", "razão 2"]},
  ...
]
Considere: especialidade, localização, avaliações, experiência, idiomas, e se é verificado.
Advogados com plano PROFESSIONAL ou ENTERPRISE devem ter prioridade.`,
        messages: [
          {
            role: 'user',
            content: `Caso: ${JSON.stringify(caseAnalysis)}
            
Localização do cliente: ${clientLocation}

Advogados disponíveis:
${JSON.stringify(relevantLawyers.slice(0, 20), null, 2)}`,
          },
        ],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        throw new Error('Resposta não contém JSON válido');
      }

      return JSON.parse(jsonMatch[0]) as LawyerMatch[];

    } catch (error) {
      console.error('Erro no matching com Claude:', error);
      return this.basicMatching(relevantLawyers, caseAnalysis, clientLocation);
    }
  },

  // Matching básico (fallback)
  basicMatching(
    lawyers: Array<{
      id: string;
      name: string;
      practiceAreas: string[];
      states: string[];
      rating: number;
      reviewCount: number;
      yearsExperience: number;
      languages: string[];
      verified: boolean;
      plan: string;
    }>,
    caseAnalysis: CaseAnalysis,
    clientLocation: string
  ): LawyerMatch[] {
    const clientState = this.extractState(clientLocation);
    
    const scored = lawyers.map(lawyer => {
      let score = 50; // base score
      const reasons: string[] = [];

      // Área de prática match
      if (lawyer.practiceAreas.some(a => a.toLowerCase().includes(caseAnalysis.practiceArea))) {
        score += 20;
        reasons.push('Especialista na área do seu caso');
      }

      // Estado match
      if (clientState && lawyer.states.some(s => s.toLowerCase() === clientState.toLowerCase())) {
        score += 15;
        reasons.push('Atua no seu estado');
      }

      // Rating
      if (lawyer.rating >= 4.5) {
        score += 10;
        reasons.push(`Avaliação excelente: ${lawyer.rating}★`);
      } else if (lawyer.rating >= 4.0) {
        score += 5;
      }

      // Verificado
      if (lawyer.verified) {
        score += 10;
        reasons.push('Advogado verificado');
      }

      // Plano premium
      if (lawyer.plan === 'ENTERPRISE') {
        score += 8;
      } else if (lawyer.plan === 'PROFESSIONAL') {
        score += 5;
      }

      // Experiência
      if (lawyer.yearsExperience >= 10) {
        score += 5;
        reasons.push(`${lawyer.yearsExperience} anos de experiência`);
      }

      // Português
      if (lawyer.languages.some(l => l.toLowerCase().includes('português') || l.toLowerCase().includes('portuguese'))) {
        score += 10;
        reasons.push('Fala português');
      }

      return { lawyerId: lawyer.id, score: Math.min(score, 100), reasons };
    });

    // Ordenar por score e retornar top 5
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  },

  // Extrair estado da localização
  extractState(location: string): string | null {
    const states = ['FL', 'CA', 'NY', 'TX', 'NJ', 'MA', 'IL', 'PA', 'GA', 'NC'];
    const upper = location.toUpperCase();
    
    for (const state of states) {
      if (upper.includes(state) || upper.includes(this.getStateName(state))) {
        return state;
      }
    }
    return null;
  },

  getStateName(abbr: string): string {
    const names: Record<string, string> = {
      FL: 'FLORIDA', CA: 'CALIFORNIA', NY: 'NEW YORK', TX: 'TEXAS',
      NJ: 'NEW JERSEY', MA: 'MASSACHUSETTS', IL: 'ILLINOIS', PA: 'PENNSYLVANIA',
      GA: 'GEORGIA', NC: 'NORTH CAROLINA',
    };
    return names[abbr] || abbr;
  },

  // Gerar resposta para chat de suporte
  async generateSupportResponse(userMessage: string, context?: string): Promise<string> {
    if (!anthropic) {
      return 'Desculpe, o assistente não está disponível no momento. Por favor, entre em contato pelo email suporte@meuadvogado.us';
    }

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 512,
        system: `Você é o assistente virtual do Meu Advogado, uma plataforma que conecta brasileiros nos EUA a advogados brasileiros.
Seja prestativo, profissional e empático. Responda em português.
IMPORTANTE: Nunca dê conselhos jurídicos específicos - sempre recomende consultar um advogado.
${context ? `Contexto adicional: ${context}` : ''}`,
        messages: [
          { role: 'user', content: userMessage },
        ],
      });

      return message.content[0].type === 'text' ? message.content[0].text : 'Desculpe, não consegui processar sua mensagem.';

    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      return 'Desculpe, houve um erro. Por favor, tente novamente.';
    }
  },
};
