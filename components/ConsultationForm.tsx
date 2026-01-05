'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Video, Phone, Users, DollarSign, AlertCircle, Check } from 'lucide-react';
import Calendar from './Calendar';

interface Lawyer {
  id: string;
  user: {
    name: string;
    email: string;
  };
  specialization: string;
  hourlyRate: number;
  verified: boolean;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface ConsultationFormProps {
  lawyer: Lawyer;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

interface FormData {
  date: string;
  time: string;
  duration: number;
  type: 'VIDEO' | 'PHONE' | 'IN_PERSON';
  notes: string;
}

export default function ConsultationForm({ lawyer, onSubmit, loading = false }: ConsultationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    date: '',
    time: '',
    duration: 30,
    type: 'VIDEO',
    notes: ''
  });

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [error, setError] = useState('');
  const [price, setPrice] = useState(0);

  useEffect(() => {
    const newPrice = (lawyer.hourlyRate * formData.duration) / 60;
    setPrice(newPrice);
  }, [formData.duration, lawyer.hourlyRate]);

  const generateTimeSlots = async (date: string) => {
    // Simular busca de horários disponíveis
    const slots: TimeSlot[] = [];
    const startHour = 8;
    const endHour = 19;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        // Simular disponibilidade (80% disponível)
        slots.push({
          time,
          available: Math.random() > 0.2
        });
      }
    }
    
    setAvailableSlots(slots);
  };

  const handleDateChange = (date: string) => {
    setFormData({ ...formData, date, time: '' });
    setError('');
    if (date) {
      generateTimeSlots(date);
    } else {
      setAvailableSlots([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (!formData.date) {
      setError('Selecione uma data');
      return;
    }

    if (!formData.time) {
      setError('Selecione um horário');
      return;
    }

    // Validar data futura
    const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
    if (selectedDateTime <= new Date()) {
      setError('Selecione uma data e hora futuras');
      return;
    }

    // Validar horário disponível
    const selectedSlot = availableSlots.find(slot => slot.time === formData.time);
    if (!selectedSlot?.available) {
      setError('Horário não disponível');
      return;
    }

    // Preparar dados para submissão
    const startTime = selectedDateTime.toISOString();
    
    onSubmit({
      lawyerId: lawyer.id,
      startTime,
      duration: formData.duration,
      type: formData.type,
      notes: formData.notes
    });
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

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Calendário */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <CalendarIcon className="w-4 h-4 inline mr-1" />
          Selecione a Data
        </label>
        <Calendar
          selectedDate={formData.date}
          onDateChange={handleDateChange}
          minDate={minDate}
        />
      </div>

      {/* Horários */}
      {formData.date && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Clock className="w-4 h-4 inline mr-1" />
            Horários Disponíveis
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
            {availableSlots.map((slot) => (
              <button
                key={slot.time}
                type="button"
                onClick={() => setFormData({ ...formData, time: slot.time })}
                disabled={!slot.available}
                className={`
                  py-2 px-3 text-sm rounded-lg border transition-colors
                  ${!slot.available
                    ? 'bg-gray-50 text-gray-300 cursor-not-allowed border-gray-200'
                    : formData.time === slot.time
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                  }
                `}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tipo e Duração */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tipo de Consulta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Consulta
          </label>
          <div className="space-y-2">
            {[
              { value: 'VIDEO', label: 'Vídeo (Jitsi)', icon: Video, description: 'Consulta por vídeo chamada' },
              { value: 'PHONE', label: 'Telefone', icon: Phone, description: 'Consulta por telefone' },
              { value: 'IN_PERSON', label: 'Presencial', icon: Users, description: 'Consulta presencial' }
            ].map(({ value, label, icon: Icon, description }) => (
              <label key={value} className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value={value}
                  checked={formData.type === value}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <span className="font-medium">{label}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Duração */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Duração da Consulta
          </label>
          <div className="space-y-2">
            {[
              { value: 30, label: '30 minutos', price: (lawyer.hourlyRate * 0.5) },
              { value: 60, label: '1 hora', price: lawyer.hourlyRate },
              { value: 90, label: '1 hora e 30 minutos', price: (lawyer.hourlyRate * 1.5) },
              { value: 120, label: '2 horas', price: (lawyer.hourlyRate * 2) }
            ].map(({ value, label, price: optionPrice }) => (
              <label key={value} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex items-center">
                  <input
                    type="radio"
                    value={value}
                    checked={formData.duration === value}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="mr-3"
                  />
                  <span className="font-medium">{label}</span>
                </div>
                <span className="text-sm text-gray-600">${optionPrice.toFixed(2)}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Observações */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observações (opcional)
        </label>
        <textarea
          rows={4}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Descreva o motivo da consulta ou informações adicionais que possam ajudar o advogado..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Resumo e Preço */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Resumo da Consulta</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Advogado:</span>
            <span className="font-medium">{lawyer.user.name}</span>
          </div>
          {formData.date && (
            <div className="flex justify-between">
              <span className="text-gray-600">Data:</span>
              <span className="font-medium">
                {new Date(formData.date).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}
          {formData.time && (
            <div className="flex justify-between">
              <span className="text-gray-600">Horário:</span>
              <span className="font-medium">{formData.time}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Tipo:</span>
            <span className="font-medium flex items-center gap-1">
              {getConsultationIcon(formData.type)}
              {getConsultationTypeLabel(formData.type)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duração:</span>
            <span className="font-medium">{formData.duration} minutos</span>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between items-center">
            <span className="text-gray-900 font-medium flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              Valor total:
            </span>
            <span className="text-xl font-bold text-blue-600">
              ${price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Botão de Submit */}
      <button
        type="submit"
        disabled={loading || !formData.date || !formData.time}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Agendando...
          </>
        ) : (
          <>
            <Check className="w-5 h-5" />
            Confirmar Agendamento
          </>
        )}
      </button>
    </form>
  );
}
