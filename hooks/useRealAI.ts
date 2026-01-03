// hooks/useRealAI.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface CaseAnalysis {
  id: string;
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
  outcomePrediction?: {
    successProbability: number;
    factors: string[];
    recommendations: string[];
  };
  documentSuggestions?: string[];
  riskFactors?: string[];
  confidence: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    tokensUsed?: number;
    model?: string;
  };
}

interface UseRealAIOptions {
  caseId?: string;
  autoSave?: boolean;
  enableChat?: boolean;
}

export function useRealAI(options: UseRealAIOptions = {}) {
  const { data: session } = useSession();
  const [analysis, setAnalysis] = useState<CaseAnalysis | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [chatting, setChatting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { caseId, autoSave = true, enableChat = true } = options;
  const abortControllerRef = useRef<AbortController | null>(null);

  // 🚨 ANÁLISE REAL DE CASO COM CLAUDE AI
  const analyzeCase = useCallback(async (caseData: any) => {
    if (!session?.user) {
      setError('Usuário não autenticado');
      return null;
    }

    // Cancelar análise anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setAnalyzing(true);
    setError(null);

    try {
      console.log('🤖 HOOK AI REAL - Iniciando análise:', {
        caseId: caseData.id || caseId,
        userId: session.user.id,
        title: caseData.title,
      });

      const response = await fetch('/api/ai/analyze-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: caseData.id || caseId }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const result = await response.json();
      
      console.log('✅ HOOK AI REAL - Análise concluída:', {
        analysisId: result.analysis.id,
        successProbability: result.analysis.successProbability,
        confidence: result.analysis.confidence,
        aiModel: result._meta?.aiModel,
      });

      setAnalysis(result.analysis);
      
      // 🚨 AUTO-SAVE SE HABILITADO
      if (autoSave) {
        localStorage.setItem(`ai_analysis_${caseId}`, JSON.stringify({
          ...result.analysis,
          savedAt: new Date().toISOString(),
        }));
      }

      return result.analysis;

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('🚫 HOOK AI - Análise cancelada');
        return null;
      }

      console.error('🚨 HOOK AI ERROR:', err);
      setError(err.message || 'Erro na análise do caso');
      return null;
    } finally {
      setAnalyzing(false);
      abortControllerRef.current = null;
    }
  }, [session, caseId, autoSave]);

  // 🎯 CHAT REAL COM IA
  const sendMessage = useCallback(async (message: string, conversationId?: string) => {
    if (!session?.user || !enableChat) {
      setError('Chat não disponível');
      return null;
    }

    setChatting(true);
    setError(null);

    // Adicionar mensagem do usuário
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);

    try {
      console.log('🤖 HOOK CHAT REAL - Enviando mensagem:', {
        userId: session.user.id,
        message: message.substring(0, 100) + '...',
        conversationId,
      });

      const response = await fetch('/api/ai/analyze-case', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          caseId,
          conversationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const result = await response.json();
      
      // Adicionar resposta da IA
      const aiMessage: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
        metadata: {
          tokensUsed: result._meta?.tokensUsed,
          model: result._meta?.aiModel,
        },
      };

      setChatMessages(prev => [...prev, aiMessage]);

      console.log('✅ HOOK CHAT REAL - Resposta recebida:', {
        tokensUsed: result._meta?.tokensUsed,
        model: result._meta?.aiModel,
      });

      return result.response;

    } catch (err: any) {
      console.error('🚨 HOOK CHAT ERROR:', err);
      setError(err.message || 'Erro no chat com IA');
      
      // Remover mensagem do usuário em caso de erro
      setChatMessages(prev => prev.slice(0, -1));
      return null;
    } finally {
      setChatting(false);
    }
  }, [session, caseId, enableChat]);

  // 🎯 LIMPAR HISTÓRICO DE CHAT
  const clearChat = useCallback(() => {
    setChatMessages([]);
    setError(null);
  }, []);

  // 🚨 CANCELAR ANÁLISE EM ANDAMENTO
  const cancelAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setAnalyzing(false);
    }
  }, []);

  // 🎯 CARREGAR ANÁLISE SALVA
  useEffect(() => {
    if (caseId && autoSave) {
      const saved = localStorage.getItem(`ai_analysis_${caseId}`);
      if (saved) {
        try {
          const parsedAnalysis = JSON.parse(saved);
          setAnalysis(parsedAnalysis);
          console.log('📂 HOOK AI - Análise carregada do cache:', {
            caseId,
            savedAt: parsedAnalysis.savedAt,
          });
        } catch (error) {
          console.error('Erro ao carregar análise salva:', error);
        }
      }
    }
  }, [caseId, autoSave]);

  // 🚨 MÉTRICAS DE USO
  const metrics = {
    totalMessages: chatMessages.length,
    analysisAvailable: !!analysis,
    confidence: analysis?.confidence || 0,
    successProbability: analysis?.successProbability || 0,
    estimatedCostRange: analysis?.estimatedCosts 
      ? `$${analysis.estimatedCosts.min} - $${analysis.estimatedCosts.max}`
      : 'N/A',
  };

  // 🎯 ESTADOS REAIS
  const isReady = !loading && !error;
  const hasAnalysis = !!analysis;
  const isChatActive = chatMessages.length > 0;

  return {
    // 🤖 DADOS DA ANÁLISE
    analysis,
    chatMessages,
    
    // 🔄 ESTADOS
    loading,
    analyzing,
    chatting,
    error,
    
    // 🎯 MÉTODOS
    analyzeCase,
    sendMessage,
    clearChat,
    cancelAnalysis,
    
    // 📊 MÉTRICAS
    metrics,
    
    // 🚨 ESTADOS DERIVADOS
    isReady,
    hasAnalysis,
    isChatActive,
    
    // 🎯 UTILITÁRIOS
    canAnalyze: !!session?.user && !analyzing,
    canChat: enableChat && !!session?.user && !chatting,
  };
}

// 🎯 HOOK ESPECÍFICO PARA DOCUMENTOS
export function useAIDocumentAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeDocument = useCallback(async (file: File, documentType: string) => {
    setAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', documentType);

      const response = await fetch('/api/ai/analyze-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      const analysisResult = await response.json();
      setResult(analysisResult);
      return analysisResult;

    } catch (err: any) {
      console.error('Document analysis error:', err);
      setError(err.message || 'Erro na análise do documento');
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  return {
    analyzeDocument,
    analyzing,
    result,
    error,
    clearResult: () => setResult(null),
  };
}
