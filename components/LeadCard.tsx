/**
 * COMPONENTE LEADCARD - PARA EXIBIR LEADS COM SCORE DE MATCHING
 * 
 * Props:
 * - lead: dados do lead
 * - score: score de matching (0-100)
 * - recommendation: HIGH/MEDIUM/LOW
 * - onAccept: função para aceitar lead
 * - onView: função para ver detalhes
 */

import React from 'react'
import Link from 'next/link'

interface LeadCardProps {
  lead: {
    id: string
    title: string
    description: string
    practiceArea: { name: string }
    contactCity: string
    contactState: string
    createdAt: string
    qualityScore: number
    client?: {
      user: { name: string; email: string }
    }
  }
  matchingScore?: number
  recommendation?: 'HIGH' | 'MEDIUM' | 'LOW'
  onAccept?: () => void
  onView?: () => void
  compact?: boolean
}

export default function LeadCard({
  lead,
  matchingScore,
  recommendation,
  onAccept,
  onView,
  compact = false
}: LeadCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-100'
    if (score >= 50) return 'text-yellow-600 bg-yellow-100'
    return 'text-orange-600 bg-orange-100'
  }

  const getRecommendationBadge = (rec: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      HIGH: { bg: 'bg-green-100', text: 'text-green-800', label: '🔥 Alta' },
      MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⚡ Média' },
      LOW: { bg: 'bg-orange-100', text: 'text-orange-800', label: '📊 Baixa' },
    }
    return badges[rec] || badges.LOW
  }

  const getUrgencyBadge = (urgency: string) => {
    const styles = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800',
    }
    return styles[urgency as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const recBadge = recommendation ? getRecommendationBadge(recommendation) : null
  const scoreColor = matchingScore ? getScoreColor(matchingScore) : null

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm">
              {lead.title || 'Lead sem título'}
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {lead.practiceArea.name} • {lead.contactCity}, {lead.contactState}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {matchingScore && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${scoreColor}`}>
                {matchingScore}%
              </span>
            )}
            {recBadge && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${recBadge.bg} ${recBadge.text}`}>
                {recBadge.label}
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-400">
            {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
          </p>
          <div className="flex gap-2">
            {onView && (
              <button
                onClick={onView}
                className="text-blue-600 hover:text-blue-700 text-xs font-medium"
              >
                Ver
              </button>
            )}
            {onAccept && (
              <button
                onClick={onAccept}
                className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
              >
                Aceitar
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
      {/* Header com score e recomendação */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg mb-1">
              {lead.title || 'Lead sem título'}
            </h3>
            <p className="text-sm text-gray-600">
              {lead.practiceArea.name} • {lead.contactCity}, {lead.contactState}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {matchingScore && (
              <div className={`px-3 py-2 rounded-full text-sm font-bold ${scoreColor}`}>
                🎯 {matchingScore}% Match
              </div>
            )}
            {recBadge && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${recBadge.bg} ${recBadge.text}`}>
                {recBadge.label}
              </span>
            )}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyBadge('MEDIUM')}`}>
              Score: {lead.qualityScore}
            </span>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">Descrição do Caso</h4>
          <p className="text-gray-700 text-sm line-clamp-3">
            {lead.description}
          </p>
        </div>

        {/* Informações do cliente */}
        {lead.client && (
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Informações do Cliente</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Nome:</span>
                <p className="font-medium text-gray-900">{lead.client.user.name}</p>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="font-medium text-gray-900 text-xs">{lead.client.user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
          <span>
            Recebido em {new Date(lead.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          {matchingScore && (
            <span className="text-gray-500">
              ID: {lead.id.slice(0, 8)}
            </span>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-3">
          {onView && (
            <button
              onClick={onView}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition font-medium text-sm"
            >
              📋 Ver Detalhes
            </button>
          )}
          {onAccept && (
            <button
              onClick={onAccept}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-blue-700 transition font-bold text-sm shadow-lg"
            >
              ✅ Aceitar Lead
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Variação para lista de recomendações
export function RecommendedLeadCard({
  lead,
  matchingScore,
  recommendation,
  onAccept,
  onView
}: Omit<LeadCardProps, 'compact'>) {
  return (
    <LeadCard
      lead={lead}
      matchingScore={matchingScore}
      recommendation={recommendation}
      onAccept={onAccept}
      onView={onView}
      compact={false}
    />
  )
}

// Variação compacta para dashboard
export function CompactLeadCard({
  lead,
  matchingScore,
  onAccept,
  onView
}: Pick<LeadCardProps, 'lead' | 'matchingScore' | 'onAccept' | 'onView'>) {
  return (
    <LeadCard
      lead={lead}
      matchingScore={matchingScore}
      onAccept={onAccept}
      onView={onView}
      compact={true}
    />
  )
}
