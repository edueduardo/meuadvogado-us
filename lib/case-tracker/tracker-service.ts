export type CaseStatus =
  | 'submitted'
  | 'under_review'
  | 'documents_requested'
  | 'waiting_response'
  | 'in_process'
  | 'approved'
  | 'denied'

export interface CaseStatusEvent {
  id: string
  status: CaseStatus
  title: string
  description: string
  timestamp: Date
  estimatedDuration?: string
  nextStep?: string
}

export const statusTimeline: Record<CaseStatus, CaseStatusEvent> = {
  submitted: {
    id: 'submitted',
    status: 'submitted',
    title: '✅ Caso Submetido',
    description: 'Seu caso foi recebido e registrado no sistema',
    timestamp: new Date(),
    estimatedDuration: '24 horas',
    nextStep: 'Revisão inicial pelo advogado'
  },
  under_review: {
    id: 'under_review',
    status: 'under_review',
    title: '🔍 Em Revisão',
    description: 'O advogado está analisando os detalhes do seu caso',
    timestamp: new Date(),
    estimatedDuration: '2-3 dias',
    nextStep: 'Reunião de estratégia'
  },
  documents_requested: {
    id: 'documents_requested',
    status: 'documents_requested',
    title: '📄 Documentos Solicitados',
    description: 'Você precisa enviar documentação adicional para continuar',
    timestamp: new Date(),
    estimatedDuration: '5-7 dias',
    nextStep: 'Você enviará documentos solicitados'
  },
  waiting_response: {
    id: 'waiting_response',
    status: 'waiting_response',
    title: '⏳ Aguardando Resposta',
    description: 'Sua aplicação foi enviada aos órgãos competentes',
    timestamp: new Date(),
    estimatedDuration: '30-90 dias',
    nextStep: 'Resposta da imigração/tribunal'
  },
  in_process: {
    id: 'in_process',
    status: 'in_process',
    title: '⚙️ Em Processamento',
    description: 'Seu caso está sendo processado pelos órgãos governamentais',
    timestamp: new Date(),
    estimatedDuration: '30-180 dias',
    nextStep: 'Possível entrevista ou decisão'
  },
  approved: {
    id: 'approved',
    status: 'approved',
    title: '🎉 Aprovado!',
    description: 'Parabéns! Seu caso foi aprovado!',
    timestamp: new Date(),
    estimatedDuration: '0 dias',
    nextStep: 'Próximos passos com seu advogado'
  },
  denied: {
    id: 'denied',
    status: 'denied',
    title: '❌ Negado',
    description: 'Infelizmente seu caso foi negado',
    timestamp: new Date(),
    estimatedDuration: '0 dias',
    nextStep: 'Opções de apelação com advogado'
  }
}

export interface CaseTracker {
  caseId: string
  clientName: string
  caseType: string
  currentStatus: CaseStatus
  statusPercentage: number
  events: CaseStatusEvent[]
  createdAt: Date
  lastUpdated: Date
  estimatedCompletionDate: Date
  lawyerName: string
  lawyerPhone: string
  lawyerEmail: string
}

export function generateMockCaseTracker(caseId: string, status: CaseStatus = 'under_review'): CaseTracker {
  const statuses: CaseStatus[] = ['submitted', 'under_review', 'documents_requested', 'waiting_response', 'in_process']
  const currentIndex = statuses.indexOf(status)

  const events: CaseStatusEvent[] = statuses.slice(0, currentIndex + 1).map((s, idx) => ({
    ...statusTimeline[s],
    timestamp: new Date(Date.now() - (statuses.length - idx) * 24 * 60 * 60 * 1000)
  }))

  return {
    caseId,
    clientName: 'João Silva',
    caseType: 'Visto de Trabalho (H1B)',
    currentStatus: status,
    statusPercentage: ((currentIndex + 1) / statuses.length) * 100,
    events,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lastUpdated: new Date(),
    estimatedCompletionDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    lawyerName: 'Dr. Carlos Santos',
    lawyerPhone: '+1 (305) 555-0123',
    lawyerEmail: 'carlos@meuadvogado.com'
  }
}

export function getStatusColor(status: CaseStatus): string {
  switch (status) {
    case 'submitted':
      return 'bg-blue-500'
    case 'under_review':
      return 'bg-yellow-500'
    case 'documents_requested':
      return 'bg-purple-500'
    case 'waiting_response':
      return 'bg-orange-500'
    case 'in_process':
      return 'bg-indigo-500'
    case 'approved':
      return 'bg-green-500'
    case 'denied':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}
