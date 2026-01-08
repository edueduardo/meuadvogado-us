'use client'

import { useState, useEffect } from 'react'
import { Bell, Phone, Mail, Calendar } from 'lucide-react'
import { type CaseTracker, generateMockCaseTracker, getStatusColor } from '@/lib/case-tracker/tracker-service'

interface CaseTrackerProps {
  caseId?: string
  variant?: 'full' | 'compact'
}

export default function CaseTrackerComponent({ caseId = 'CASE-2024-001', variant = 'full' }: CaseTrackerProps) {
  const [tracker, setTracker] = useState<CaseTracker | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setTracker(generateMockCaseTracker(caseId, 'waiting_response'))
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [caseId])

  if (loading || !tracker) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 text-white">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
          <div className="h-20 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-blue-100">Seu Caso</div>
            <div className="font-bold">{tracker.currentStatus.replace('_', ' ').toUpperCase()}</div>
          </div>
          <div className="text-3xl">{tracker.statusPercentage.toFixed(0)}%</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-8 text-white">
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">ID do Caso</div>
            <h2 className="text-3xl font-bold">{tracker.caseId}</h2>
            <p className="text-gray-400 mt-1">{tracker.caseType}</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-blue-400">{tracker.statusPercentage.toFixed(0)}%</div>
            <div className="text-sm text-gray-400">Progresso</div>
          </div>
        </div>

        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStatusColor(tracker.currentStatus)}`}
            style={{ width: `${tracker.statusPercentage}%` }}
          />
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="text-4xl">📍</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">
              {tracker.events[tracker.events.length - 1]?.title || 'Status Desconhecido'}
            </h3>
            <p className="text-gray-300 text-sm mb-3">
              {tracker.events[tracker.events.length - 1]?.description}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold mb-6">Timeline do Caso</h3>
        <div className="space-y-4">
          {tracker.events.map((event, idx) => (
            <div key={idx} className="flex gap-4">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(event.status)} mt-2`} />
              <div className="flex-1">
                <div className="font-semibold">{event.title}</div>
                <p className="text-gray-400 text-sm">{event.description}</p>
                <div className="text-xs text-gray-500 mt-1">
                  {event.timestamp.toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8">
        <h3 className="font-bold mb-4">👨‍⚖️ Seu Advogado</h3>
        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-400">Nome</div>
            <div className="font-semibold">{tracker.lawyerName}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <a
              href={`tel:${tracker.lawyerPhone}`}
              className="flex items-center gap-2 bg-blue-600 text-white p-3 rounded-lg transition hover:bg-blue-700"
            >
              <Phone size={16} />
              <div className="text-sm font-semibold">{tracker.lawyerPhone}</div>
            </a>
            <a
              href={`mailto:${tracker.lawyerEmail}`}
              className="flex items-center gap-2 bg-purple-600 text-white p-3 rounded-lg transition hover:bg-purple-700"
            >
              <Mail size={16} />
              <div className="text-sm font-semibold">Email</div>
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg text-sm text-gray-300 flex items-start gap-2">
        <Bell size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Notificações:</strong> Você receberá atualizações automáticas quando houver mudanças.
        </div>
      </div>
    </div>
  )
}
