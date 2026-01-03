// =============================================================================
// LEGALAI - AI SERVICE (REAL CLAUDE INTEGRATION)
// =============================================================================
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key-for-build',
});

export interface CaseAnalysisResult {
  summary: string;
  legalBasis: string[];
  recommendedActions: string[];
  successProbability: number;
  estimatedTimeline: string;
  potentialChallenges: string[];
  requiredDocuments: string[];
  jurisdiction: string;
  precedents: string[];
  estimatedCosts: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface DocumentAnalysisResult {
  documentType: string;
  keyInformation: Record<string, any>;
  legalImplications: string[];
  risks: string[];
  recommendations: string[];
  confidence: number;
}

export class LegalAIService {
  private readonly SYSTEM_PROMPT = `You are an expert legal AI assistant specializing in US immigration law and Brazilian-American legal matters. 
  You have extensive knowledge of:
  - US immigration processes (visas, green cards, citizenship)
  - Brazilian law and its interaction with US law
  - International legal frameworks
  - Contract law and business law
  - Family law with international elements
  
  Always provide:
  1. Clear, actionable advice
  2. Specific legal references when applicable
  3. Risk assessments
  4. Practical next steps
  5. Cost estimates when possible
  
  Be thorough but concise. Always include disclaimers that this is not legal advice and users should consult qualified attorneys.`;

  async analyzeCase(caseData: {
    description: string;
    category: string;
    urgency: string;
    location: string;
    clientInfo?: {
      nationality: string;
      visaStatus?: string;
      familyStatus?: string;
    };
  }): Promise<CaseAnalysisResult> {
    try {
      const prompt = this.buildCaseAnalysisPrompt(caseData);
      
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        system: this.SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return this.parseCaseAnalysisResponse(content.text);
      }

      throw new Error('Invalid response format from Claude');
    } catch (error) {
      console.error('Error analyzing case:', error);
      throw new Error('Failed to analyze case');
    }
  }

  async analyzeDocument(documentContent: string, documentType: string): Promise<DocumentAnalysisResult> {
    try {
      const prompt = this.buildDocumentAnalysisPrompt(documentContent, documentType);
      
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 3000,
        system: this.SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return this.parseDocumentAnalysisResponse(content.text);
      }

      throw new Error('Invalid response format from Claude');
    } catch (error) {
      console.error('Error analyzing document:', error);
      throw new Error('Failed to analyze document');
    }
  }

  async generateLegalDocument(template: string, variables: Record<string, any>): Promise<string> {
    try {
      const prompt = this.buildDocumentGenerationPrompt(template, variables);
      
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 5000,
        system: this.SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return content.text;
      }

      throw new Error('Invalid response format from Claude');
    } catch (error) {
      console.error('Error generating document:', error);
      throw new Error('Failed to generate document');
    }
  }

  async predictCaseOutcome(caseData: any, lawyerExperience: any): Promise<{
    successProbability: number;
    factors: string[];
    recommendations: string[];
  }> {
    try {
      const prompt = this.buildOutcomePredictionPrompt(caseData, lawyerExperience);
      
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: this.SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return this.parseOutcomePredictionResponse(content.text);
      }

      throw new Error('Invalid response format from Claude');
    } catch (error) {
      console.error('Error predicting outcome:', error);
      throw new Error('Failed to predict outcome');
    }
  }

  async chatWithAI(message: string, context: {
    caseId?: string;
    conversationHistory?: Array<{role: string, content: string}>;
    userType: 'client' | 'lawyer';
  }): Promise<string> {
    try {
      const messages: any[] = [];
      
      // Add conversation history if provided
      if (context.conversationHistory) {
        messages.push(...context.conversationHistory);
      }
      
      // Add current message
      messages.push({
        role: 'user',
        content: message,
      });

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: `${this.SYSTEM_PROMPT}\n\nYou are assisting a ${context.userType}. Tailor your response accordingly.`,
        messages,
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return content.text;
      }

      throw new Error('Invalid response format from Claude');
    } catch (error) {
      console.error('Error in AI chat:', error);
      throw new Error('Failed to get AI response');
    }
  }

  private buildCaseAnalysisPrompt(caseData: any): string {
    return `
    Analyze this legal case and provide comprehensive analysis:
    
    Case Description: ${caseData.description}
    Category: ${caseData.category}
    Urgency: ${caseData.urgency}
    Location: ${caseData.location}
    
    Client Information:
    - Nationality: ${caseData.clientInfo?.nationality || 'Not specified'}
    - Visa Status: ${caseData.clientInfo?.visaStatus || 'Not specified'}
    - Family Status: ${caseData.clientInfo?.familyStatus || 'Not specified'}
    
    Please provide analysis in the following JSON format:
    {
      "summary": "Brief case summary",
      "legalBasis": ["Relevant laws and precedents"],
      "recommendedActions": ["Specific steps to take"],
      "successProbability": 0.75,
      "estimatedTimeline": "6-12 months",
      "potentialChallenges": ["Possible obstacles"],
      "requiredDocuments": ["Documents needed"],
      "jurisdiction": "Relevant jurisdiction",
      "precedents": ["Similar cases"],
      "estimatedCosts": {
        "min": 5000,
        "max": 15000,
        "currency": "USD"
      }
    }
    `;
  }

  private buildDocumentAnalysisPrompt(content: string, type: string): string {
    return `
    Analyze this legal document (${type}):
    
    Document Content:
    ${content}
    
    Please provide analysis in this JSON format:
    {
      "documentType": "Type of document",
      "keyInformation": {
        "parties": ["List of parties"],
        "dates": ["Important dates"],
        "amounts": ["Financial amounts"],
        "obligations": ["Key obligations"]
      },
      "legalImplications": ["Legal implications"],
      "risks": ["Potential risks"],
      "recommendations": ["Recommendations"],
      "confidence": 0.85
    }
    `;
  }

  private buildDocumentGenerationPrompt(template: string, variables: Record<string, any>): string {
    return `
    Generate a legal document using this template and variables:
    
    Template Type: ${template}
    
    Variables:
    ${JSON.stringify(variables, null, 2)}
    
    Generate a complete, professional legal document that:
    1. Uses all provided variables appropriately
    2. Includes proper legal language
    3. Has clear structure and formatting
    4. Includes necessary disclaimers
    5. Is ready for attorney review
    
    Format the document with proper headings, numbered sections, and professional formatting.
    `;
  }

  private buildOutcomePredictionPrompt(caseData: any, lawyerExperience: any): string {
    return `
    Predict the likely outcome of this case:
    
    Case Details:
    ${JSON.stringify(caseData, null, 2)}
    
    Lawyer Experience:
    ${JSON.stringify(lawyerExperience, null, 2)}
    
    Provide prediction in this JSON format:
    {
      "successProbability": 0.75,
      "factors": ["Factors influencing success"],
      "recommendations": ["Recommendations to improve chances"]
    }
    `;
  }

  private parseCaseAnalysisResponse(text: string): CaseAnalysisResult {
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback parsing if JSON extraction fails
      return {
        summary: text.substring(0, 200) + '...',
        legalBasis: ['Analysis in progress'],
        recommendedActions: ['Consult with attorney'],
        successProbability: 0.5,
        estimatedTimeline: 'To be determined',
        potentialChallenges: ['Pending review'],
        requiredDocuments: ['Case documents'],
        jurisdiction: 'To be determined',
        precedents: ['Research needed'],
        estimatedCosts: { min: 1000, max: 10000, currency: 'USD' },
      };
    } catch (error) {
      console.error('Error parsing case analysis:', error);
      throw new Error('Failed to parse analysis response');
    }
  }

  private parseDocumentAnalysisResponse(text: string): DocumentAnalysisResult {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        documentType: 'Unknown',
        keyInformation: {},
        legalImplications: ['Analysis in progress'],
        risks: ['Review needed'],
        recommendations: ['Consult attorney'],
        confidence: 0.5,
      };
    } catch (error) {
      console.error('Error parsing document analysis:', error);
      throw new Error('Failed to parse document analysis');
    }
  }

  private parseOutcomePredictionResponse(text: string): any {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        successProbability: 0.5,
        factors: ['Analysis in progress'],
        recommendations: ['Consult attorney'],
      };
    } catch (error) {
      console.error('Error parsing outcome prediction:', error);
      throw new Error('Failed to parse outcome prediction');
    }
  }

  // Analytics and Learning
  async trackAIUsage(userId: string, action: string, tokensUsed: number): Promise<void> {
    try {
      // await prisma.auditLog.create({
    //   data: {
    //     userId,
    //     action: `AI_${action}`,
    //     // metadata: { // Campo não existe no schema
    //     //   tokensUsed,
    //     //   timestamp: new Date(),
    //     // },
    //   },
    // });
    } catch (error) {
      console.error('Error tracking AI usage:', error);
    }
  }

  async getAIUsageStats(userId?: string): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
  }> {
    try {
      const where = userId ? { userId, action: { startsWith: 'AI_' } } : { action: { startsWith: 'AI_' } };
      
      // const logs = await prisma.auditLog.findMany({
    //   where: userId ? { userId, action: { startsWith: 'AI_' } } : { action: { startsWith: 'AI_' } },
    //   select: {
    //     // metadata: true, // Campo não existe
    //   },
    // });

    // const stats = logs.reduce((acc, log) => {
    //   const tokens = (log.metadata as any)?.tokensUsed || 0;
    //   return {
    //     totalRequests: acc.totalRequests + 1,
    //     totalTokens: acc.totalTokens + tokens,
    //     totalCost: acc.totalCost + (tokens * 0.000003), // Claude pricing
    //   };
    // }, { totalRequests: 0, totalTokens: 0, totalCost: 0 });

    const stats = { totalRequests: 0, totalTokens: 0, totalCost: 0 }; // Temporário

      return stats;
    } catch (error) {
      console.error('Error getting AI usage stats:', error);
      return { totalRequests: 0, totalTokens: 0, totalCost: 0 };
    }
  }
}

export const legalAIService = new LegalAIService();
