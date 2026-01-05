'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Calendar as CalendarIcon, Clock, Video, Phone, Users, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Lawyer {
  id: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  specialization: string;
  experience: string;
  rating: number;
  totalReviews: number;
  hourlyRate: number;
  verified: boolean;
  location: string;
  bio?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface FormData {
  date: string;
  time: string;
  duration: number;
  type: 'VIDEO' | 'PHONE' | 'IN_PERSON';
  notes: string;
}

export default function AgendarConsultaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const lawyerId = params.lawyerId as string;

  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [consultation, setConsultation] = useState<any>(null);

  const [formData, setFormData] = useState<FormData>({
    date: '',
    time: '',
    duration: 30,
    type: 'VIDEO',
    notes: ''
  });

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    loadLawyer();
  }, [session, status, lawyerId]);

  const loadLawyer = async () => {
    try {
      const res = await fetch(`/api/lawyers/${lawyerId}`);
      if (!res.ok) {
        throw new Error('Advogado não encontrado');
      }
      const data = await res.json();
      setLawyer(data);
    } catch (error) {
      console.error('Erro ao carregar advogado:', error);
      setError('Advogado não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = (date: string) => {
    const slots: TimeSlot[] = [];
    const startHour = 8;
    const endHour = 19;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time,
          available: Math.random() > 0.3 // 70% disponibilidade simulada
        });
      }
    }
    
    setAvailableSlots(slots);
  };

  const handleDateChange = (date: string) => {
    setFormData({ ...formData, date, time: '' });
    if (date) {
      generateTimeSlots(date);
    } else {
      setAvailableSlots([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Validar data futura
      const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
      if (selectedDateTime <= new Date()) {
        throw new Error('Selecione uma data e hora futuras');
      }

      // Criar consulta
      const startTime = selectedDateTime.toISOString();
      
      const res = await fetch('/api/consultations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lawyerId,
          startTime,
          duration: formData.duration,
          type: formData.type,
          notes: formData.notes
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao agendar consulta');
      }

      setConsultation(data);
      setSuccess(true);
    } catch (error: any) {
      setError(error.message || 'Erro ao agendar consulta');
    } finally {
      setSubmitting(false);
    }
  };

  const getConsultationIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <Video className="w-5 h-5" />;
      case 'PHONE': return <Phone className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  const getConsultationTypeLabel = (type: string) => {
    switch (type) {
      case 'VIDEO': return 'Vídeo (Jitsi)';
      case 'PHONE': return 'Telefone';
      case 'IN_PERSON': return 'Presencial';
      default: return type;
    }
  };

  const calculatePrice = () => {
    if (!lawyer) return 0;
    return (lawyer.hourlyRate * formData.duration) / 60;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error || 'Advogado não encontrado'}</p>
          <Link href="/consultas" className="mt-4 inline-block text-blue-600 hover:underline">
            Voltar para Consultas
          </Link>
        </div>
      </div>
    );
  }

  if (success && consultation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Consulta Agendada!</h2>
          <p className="text-gray-600 mb-6">
            Sua consulta foi agendada com sucesso. Você receberá um email de confirmação.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              {getConsultationIcon(consultation.type)}
              <span className="font-medium">{getConsultationTypeLabel(consultation.type)}</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              Advogado: {lawyer.user.name}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              Data: {new Date(consultation.startTime).toLocaleDateString('pt-BR')}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              Horário: {new Date(consultation.startTime).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <p className="text-sm text-gray-600">
              Duração: {consultation.duration} minutos
            </p>
            {consultation.jitsiLink && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm font-medium text-gray-900 mb-2">Link da consulta:</p>
                <a 
                  href={consultation.jitsiLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm break-all"
                >
                  {consultation.jitsiLink}
                </a>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {consultation.jitsiLink && (
              <button
                onClick={() => window.open(consultation.jitsiLink, '_blank')}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Entrar na Sala de Vídeo
              </button>
            )}
            <Link
              href="/consultas"
              className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Minhas Consultas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link
              href="/consultas"
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Agendar Consulta</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info do Advogado */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xl">
                {lawyer.user.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-bold text-gray-900">{lawyer.user.name}</h2>
                {lawyer.verified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Verificado
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-2">{lawyer.specialization}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>⭐ {lawyer.rating} ({lawyer.totalReviews} avaliações)</span>
                <span>📍 {lawyer.location}</span>
                <span>💰 ${lawyer.hourlyRate}/h</span>
              </div>
              {lawyer.bio && (
                <p className="mt-3 text-sm text-gray-600">{lawyer.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                Data da Consulta
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Horário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Horário
              </label>
              <select
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                disabled={!formData.date || availableSlots.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Selecione um horário</option>
                {availableSlots.map((slot) => (
                  <option 
                    key={slot.time} 
                    value={slot.time}
                    disabled={!slot.available}
                  >
                    {slot.time} {!slot.available && '(Indisponível)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Consulta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Consulta
              </label>
              <div className="space-y-2">
                {[
                  { value: 'VIDEO', label: 'Vídeo (Jitsi)', icon: Video },
                  { value: 'PHONE', label: 'Telefone', icon: Phone },
                  { value: 'IN_PERSON', label: 'Presencial', icon: Users }
                ].map(({ value, label, icon: Icon }) => (
                  <label key={value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value={value}
                      checked={formData.type === value}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="mr-3"
                    />
                    <Icon className="w-4 h-4 mr-2 text-gray-600" />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Duração */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duração
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={30}>30 minutos</option>
                <option value={60}>1 hora</option>
                <option value={90}>1 hora e 30 minutos</option>
                <option value={120}>2 horas</option>
              </select>
            </div>

            {/* Observações */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações (opcional)
              </label>
              <textarea
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Descreva o motivo da consulta ou informações adicionais..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Preço */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Valor estimado:</span>
              <span className="text-2xl font-bold text-gray-900">
                ${calculatePrice().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="mt-6 flex gap-4">
            <Link
              href="/consultas"
              className="flex-1 bg-gray-100 text-gray-700 text-center py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={submitting || !formData.date || !formData.time}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {submitting ? 'Agendando...' : 'Confirmar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
