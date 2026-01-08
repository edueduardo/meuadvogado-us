/**
 * Quiz Scoring Algorithm
 * Calcula a probabilidade de sucesso do caso baseado em respostas
 */

export interface QuizQuestion {
  id: string
  category: string
  question: string
  description?: string
  answers: Array<{
    text: string
    score: number
    impact: string
  }>
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'case_type',
    category: 'Tipo de Caso',
    question: 'Qual é sua situação principal?',
    answers: [
      { text: 'Visto de Trabalho (H1B, L1)', score: 85, impact: 'positive' },
      { text: 'Green Card / Imigração Familiar', score: 80, impact: 'positive' },
      { text: 'Asilo ou Proteção', score: 65, impact: 'neutral' },
      { text: 'Visa vencida, preciso regularizar', score: 70, impact: 'neutral' },
      { text: 'Processo de deportação em andamento', score: 40, impact: 'negative' }
    ]
  },
  {
    id: 'documentation',
    category: 'Documentação',
    question: 'Você tem seus documentos em ordem?',
    answers: [
      { text: 'Sim, todos originais e digitalizados', score: 25, impact: 'positive' },
      { text: 'Tenho maioria dos documentos', score: 15, impact: 'neutral' },
      { text: 'Estou faltando alguns documentos', score: 10, impact: 'negative' },
      { text: 'Documentação está perdida/incompleta', score: -20, impact: 'negative' }
    ]
  },
  {
    id: 'criminal_history',
    category: 'Histórico Criminal',
    question: 'Você tem histórico criminal nos EUA ou Brasil?',
    answers: [
      { text: 'Não, tenho antecedentes limpos', score: 25, impact: 'positive' },
      { text: 'Pequena infração de trânsito', score: 5, impact: 'neutral' },
      { text: 'Processo pendente, não condenado', score: -10, impact: 'negative' },
      { text: 'Condenado por felony', score: -50, impact: 'negative' }
    ]
  },
  {
    id: 'time_in_us',
    category: 'Tempo nos EUA',
    question: 'Quanto tempo você está nos EUA?',
    answers: [
      { text: 'Menos de 1 ano', score: 10, impact: 'neutral' },
      { text: '1-3 anos', score: 15, impact: 'neutral' },
      { text: '3-5 anos', score: 20, impact: 'positive' },
      { text: 'Mais de 5 anos com raízes profundas', score: 25, impact: 'positive' }
    ]
  }
]

export interface QuizResult {
  totalScore: number
  successProbability: number
  complexity: 'low' | 'medium' | 'high'
  recommendation: string
  needsLawyer: boolean
  riskFactors: string[]
  positiveFactors: string[]
}

export function calculateQuizResult(answers: Record<string, number>): QuizResult {
  let totalScore = 0
  const riskFactors: string[] = []
  const positiveFactors: string[] = []

  for (const [questionId, answerIndex] of Object.entries(answers)) {
    const question = quizQuestions.find(q => q.id === questionId)
    if (!question || !question.answers[answerIndex]) continue

    const answer = question.answers[answerIndex]
    totalScore += answer.score

    if (answer.impact === 'negative') {
      riskFactors.push(`${question.category}: ${answer.text}`)
    } else if (answer.impact === 'positive') {
      positiveFactors.push(`${question.category}: ${answer.text}`)
    }
  }

  const maxPossibleScore = quizQuestions.reduce(
    (sum, q) => sum + Math.max(...q.answers.map(a => a.score)),
    0
  )
  const minPossibleScore = quizQuestions.reduce(
    (sum, q) => sum + Math.min(...q.answers.map(a => a.score)),
    0
  )

  const normalizedScore = Math.max(
    0,
    Math.min(100, ((totalScore - minPossibleScore) / (maxPossibleScore - minPossibleScore)) * 100)
  )

  let complexity: 'low' | 'medium' | 'high' = 'medium'
  let recommendation = ''

  if (normalizedScore >= 80) {
    complexity = 'low'
    recommendation = 'Seu caso parece bem estruturado. Um advogado pode resolver em 2-4 meses.'
  } else if (normalizedScore >= 60) {
    complexity = 'medium'
    recommendation = 'Seu caso tem complicações moderadas. Será preciso mais tempo e estratégia.'
  } else {
    complexity = 'high'
    recommendation = 'Seu caso é complexo. Você precisa de um advogado experiente para discutir opções.'
  }

  return {
    totalScore,
    successProbability: Math.round(normalizedScore),
    complexity,
    recommendation,
    needsLawyer: true,
    riskFactors,
    positiveFactors
  }
}
