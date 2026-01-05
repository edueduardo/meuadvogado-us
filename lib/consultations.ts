// lib/consultations.ts
// Helpers e utilidades para consultas

export interface CreateConsultationData {
  lawyerId: string;
  startTime: string;
  duration: number;
  type: 'VIDEO' | 'PHONE' | 'IN_PERSON';
  notes?: string;
}

export interface Consultation {
  id: string;
  scheduledAt: string;
  startTime: string;
  duration: number;
  consultationType: string;
  status: string;
  meetingLink?: string;
  lawyer: {
    user: {
      name: string;
      email: string;
    };
  };
  client?: {
    user: {
      name: string;
      email: string;
    };
  };
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

// Gerar slots de tempo disponíveis para um dia
export function generateTimeSlots(
  date: string,
  existingConsultations: Consultation[],
  duration: number = 30
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const startHour = 8;
  const endHour = 19;
  
  // Converter consultas existentes para timestamps
  const occupiedSlots = existingConsultations.map(consultation => {
    const start = new Date(consultation.startTime);
    const end = new Date(start.getTime() + consultation.duration * 60000);
    return { start, end };
  });

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const slotStart = new Date(`${date}T${slotTime}`);
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);

      // Verificar se o slot conflita com consultas existentes
      const isAvailable = !occupiedSlots.some(occupied => {
        return (
          (slotStart >= occupied.start && slotStart < occupied.end) ||
          (slotEnd > occupied.start && slotEnd <= occupied.end) ||
          (slotStart <= occupied.start && slotEnd >= occupied.end)
        );
      });

      slots.push({
        time: slotTime,
        available: isAvailable
      });
    }
  }
  
  return slots;
}

// Validar data futura
export function isValidFutureDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
}

// Validar horário comercial
export function isValidBusinessTime(time: string): boolean {
  const [hours, minutes] = time.split(':').map(Number);
  const hourInMinutes = hours * 60 + minutes;
  const businessStart = 8 * 60; // 8:00
  const businessEnd = 19 * 60; // 19:00
  
  return hourInMinutes >= businessStart && hourInMinutes < businessEnd;
}

// Formatar data para exibição
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// Formatar hora para exibição
export function formatTime(timeString: string): string {
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Calcular preço da consulta
export function calculatePrice(hourlyRate: number, duration: number): number {
  return (hourlyRate * duration) / 60;
}

// Gerar link Jitsi (se não fornecido pela API)
export function generateJitsiLink(consultationId: string, lawyerName: string, clientName: string): string {
  const baseUrl = "https://meet.jit.si";
  const roomName = `meuadvogado-${consultationId}`;
  const params = new URLSearchParams({
    config: `prejoinPageEnabled=false&startWithAudioMuted=false&startWithVideoMuted=false`,
    userInfo: `{"displayName":"${clientName}"}`
  });
  return `${baseUrl}/${roomName}?${params.toString()}`;
}

// Status da consulta
export function getConsultationStatusInfo(status: string) {
  const statusMap = {
    scheduled: {
      label: 'Agendada',
      color: 'bg-blue-100 text-blue-800',
      icon: '📅'
    },
    completed: {
      label: 'Concluída',
      color: 'bg-green-100 text-green-800',
      icon: '✅'
    },
    cancelled: {
      label: 'Cancelada',
      color: 'bg-red-100 text-red-800',
      icon: '❌'
    },
    'in_progress': {
      label: 'Em andamento',
      color: 'bg-yellow-100 text-yellow-800',
      icon: '⏳'
    },
    'no-show': {
      label: 'Não compareceu',
      color: 'bg-gray-100 text-gray-800',
      icon: '🚫'
    }
  };

  return statusMap[status as keyof typeof statusMap] || {
    label: status,
    color: 'bg-gray-100 text-gray-800',
    icon: '📝'
  };
}

// Tipo da consulta
export function getConsultationTypeInfo(type: string) {
  const typeMap = {
    VIDEO: {
      label: 'Vídeo',
      description: 'Consulta por vídeo chamada',
      icon: '🎥',
      color: 'text-blue-600'
    },
    PHONE: {
      label: 'Telefone',
      description: 'Consulta por telefone',
      icon: '📞',
      color: 'text-green-600'
    },
    IN_PERSON: {
      label: 'Presencial',
      description: 'Consulta presencial',
      icon: '👥',
      color: 'text-purple-600'
    }
  };

  return typeMap[type as keyof typeof typeMap] || {
    label: type,
    description: type,
    icon: '📝',
    color: 'text-gray-600'
  };
}

// Verificar se consulta pode ser iniciada/joinada
export function canJoinConsultation(consultation: Consultation): boolean {
  if (consultation.status !== 'scheduled') return false;
  if (consultation.consultationType !== 'VIDEO') return false;
  
  const now = new Date();
  const startTime = new Date(consultation.startTime);
  const startTimeMinus5Min = new Date(startTime.getTime() - 5 * 60000);
  
  return now >= startTimeMinus5Min;
}

// Obter próximas consultas
export function getUpcomingConsultations(consultations: Consultation[], limit: number = 3): Consultation[] {
  return consultations
    .filter(c => new Date(c.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, limit);
}

// Obter consultas passadas
export function getPastConsultations(consultations: Consultation[]): Consultation[] {
  return consultations
    .filter(c => new Date(c.startTime) <= new Date())
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}

// Agrupar consultas por status
export function groupConsultationsByStatus(consultations: Consultation[]) {
  return consultations.reduce((groups, consultation) => {
    const status = consultation.status;
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(consultation);
    return groups;
  }, {} as Record<string, Consultation[]>);
}

// Validar formulário de agendamento
export function validateConsultationForm(data: CreateConsultationData): string[] {
  const errors: string[] = [];

  if (!data.lawyerId) {
    errors.push('Advogado é obrigatório');
  }

  if (!data.startTime) {
    errors.push('Data e hora são obrigatórias');
  } else {
    if (!isValidFutureDate(data.startTime)) {
      errors.push('Data e hora devem ser futuras');
    }

    const time = new Date(data.startTime).toTimeString().slice(0, 5);
    if (!isValidBusinessTime(time)) {
      errors.push('Horário deve estar entre 8:00 e 19:00');
    }
  }

  if (!data.duration || data.duration < 15 || data.duration > 480) {
    errors.push('Duração deve ser entre 15 minutos e 8 horas');
  }

  if (!data.type || !['VIDEO', 'PHONE', 'IN_PERSON'].includes(data.type)) {
    errors.push('Tipo de consulta inválido');
  }

  return errors;
}

// API calls
export const consultationsApi = {
  // Criar consulta
  async create(data: CreateConsultationData) {
    const response = await fetch('/api/consultations/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao agendar consulta');
    }

    return response.json();
  },

  // Listar consultas do usuário
  async list(status?: string) {
    const url = status ? `/api/consultations/create?status=${status}` : '/api/consultations/create';
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Erro ao carregar consultas');
    }

    return response.json();
  },

  // Obter consultas de um advogado específico
  async getByLawyer(lawyerId: string, date?: string) {
    const url = date 
      ? `/api/consultations/create?lawyerId=${lawyerId}&date=${date}`
      : `/api/consultations/create?lawyerId=${lawyerId}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Erro ao carregar consultas do advogado');
    }

    return response.json();
  }
};
