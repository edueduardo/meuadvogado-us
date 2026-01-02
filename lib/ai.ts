import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeLegalCase(caseDescription: string) {
  const prompt = `
  Você é um assistente jurídico especializado em imigração brasileira nos EUA.
  
  Analise o seguinte caso:
  "${caseDescription}"
  
  Forneça:
  1. Área(s) do direito aplicável (Imigração, Família, Trabalhista, etc)
  2. Possíveis soluções
  3. Documentos necessários
  4. Prazos importantes
  5. Nível de urgência (baixo/médio/alto)
  6. 3 advogados recomendados (baseado em especialidade)
  
  Responda em português de forma clara e acessível.
  `;
  
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });
    
    return response.content[0].text;
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return null;
  }
}
