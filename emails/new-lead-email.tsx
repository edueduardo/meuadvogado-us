/**
 * TEMPLATE EMAIL - NOVO LEAD DISPONÍVEL
 * 
 * Email enviado para advogados quando novo lead disponível
 * compatível com sua área de prática
 */

import * as React from 'react'

interface NewLeadEmailProps {
  lawyerName: string
  lawyerEmail: string
  leadData: {
    id: string
    title: string
    practiceArea: string
    city: string
    state: string
    description: string
    urgency: string
    qualityScore: number
    clientName: string
    createdAt: string
    matchScore?: number
    recommendation?: 'HIGH' | 'MEDIUM' | 'LOW'
  }
  dashboardUrl: string
  leadUrl: string
}

export default function NewLeadEmail({
  lawyerName,
  lawyerEmail,
  leadData,
  dashboardUrl,
  leadUrl
}: NewLeadEmailProps) {
  const getUrgencyColor = (urgency: string) => {
    const colors = {
      LOW: '#10b981', // green
      MEDIUM: '#f59e0b', // yellow
      HIGH: '#f97316', // orange
      URGENT: '#ef4444', // red
    }
    return colors[urgency as keyof typeof colors] || '#6b7280'
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981' // green
    if (score >= 60) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  const getRecommendationBadge = (rec: string) => {
    const badges = {
      HIGH: { bg: '#dcfce7', color: '#166534', label: '🔥 Alta Prioridade' },
      MEDIUM: { bg: '#fef3c7', color: '#92400e', label: '⚡ Boa Oportunidade' },
      LOW: { bg: '#fed7aa', color: '#9a3412', label: '📊 Analisar' },
    }
    return badges[rec as keyof typeof badges] || badges.LOW
  }

  const recBadge = leadData.recommendation ? getRecommendationBadge(leadData.recommendation) : null

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#f8fafc'
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#1e40af',
          padding: '24px',
          textAlign: 'center',
          borderRadius: '8px 8px 0 0'
        }}
      >
        <h1
          style={{
            color: 'white',
            margin: '0',
            fontSize: '28px',
            fontWeight: 'bold'
          }}
        >
          🎯 Novo Lead Disponível!
        </h1>
        <p
          style={{
            color: '#93c5fd',
            margin: '8px 0 0 0',
            fontSize: '16px'
          }}
        >
          Oportunidade perfeita para sua área de atuação
        </p>
      </div>

      {/* Conteúdo */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '0 0 8px 8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Saudação */}
        <p
          style={{
            fontSize: '18px',
            color: '#374151',
            marginBottom: '24px'
          }}
        >
          Olá, <strong>{lawyerName}</strong>!
        </p>

        {/* Mensagem principal */}
        <p
          style={{
            fontSize: '16px',
            color: '#4b5563',
            lineHeight: '1.6',
            marginBottom: '24px'
          }}
        >
          Temos um novo lead que combina perfeitamente com seu perfil. 
          Este cliente está procurando por um profissional qualificado e 
          você foi selecionado pelo nosso algoritmo de matching inteligente.
        </p>

        {/* Cards de Informações */}
        <div style={{ marginBottom: '24px' }}>
          {/* Score e Recomendação */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '16px'
            }}
          >
            {leadData.matchScore && (
              <div
                style={{
                  backgroundColor: getScoreColor(leadData.matchScore),
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                🎯 {leadData.matchScore}% Match
              </div>
            )}
            {recBadge && (
              <div
                style={{
                  backgroundColor: recBadge.bg,
                  color: recBadge.color,
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {recBadge.label}
              </div>
            )}
            <div
              style={{
                backgroundColor: '#f3f4f6',
                color: '#374151',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ⭐ Score: {leadData.qualityScore}/100
            </div>
          </div>

          {/* Informações do Lead */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '16px'
            }}
          >
            <h3
              style={{
                color: '#111827',
                fontSize: '18px',
                fontWeight: 'bold',
                margin: '0 0 12px 0'
              }}
            >
              {leadData.title || 'Novo Caso'}
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  backgroundColor: getUrgencyColor(leadData.urgency),
                  color: 'white',
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '8px'
                }}
              >
                {leadData.urgency}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#374151' }}>Área:</strong>{' '}
              <span style={{ color: '#4b5563' }}>{leadData.practiceArea}</span>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#374151' }}>Localização:</strong>{' '}
              <span style={{ color: '#4b5563' }}>
                {leadData.city}, {leadData.state}
              </span>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#374151' }}>Cliente:</strong>{' '}
              <span style={{ color: '#4b5563' }}>{leadData.clientName}</span>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#374151' }}>Descrição:</strong>
              <p
                style={{
                  color: '#4b5563',
                  margin: '8px 0 0 0',
                  lineHeight: '1.5',
                  fontSize: '14px'
                }}
              >
                {leadData.description.length > 200 
                  ? leadData.description.substring(0, 200) + '...'
                  : leadData.description
                }
              </p>
            </div>

            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Recebido em {new Date(leadData.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <a
            href={leadUrl}
            style={{
              display: 'inline-block',
              backgroundColor: '#10b981',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s'
            }}
          >
            ✅ Ver e Aceitar Lead
          </a>
          <p style={{ margin: '12px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
            ou{' '}
            <a
              href={dashboardUrl}
              style={{
                color: '#1e40af',
                textDecoration: 'underline'
              }}
            >
              ver todos os leads
            </a>
          </p>
        </div>

        {/* Alerta de urgência */}
        <div
          style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}
        >
          <p
            style={{
              margin: '0',
              fontSize: '14px',
              color: '#92400e',
              textAlign: 'center'
            }}
          >
            ⚡ <strong>Ação rápida recomendada!</strong> Leads respondidos em 
            até 2 horas têm 3x mais chances de conversão.
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '24px',
            textAlign: 'center'
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
            Este email foi enviado para {lawyerEmail}
          </p>
          <p style={{ margin: '0', fontSize: '12px', color: '#9ca3af' }}>
            Se você não quer mais receber notificações,{' '}
            <a
              href={`${dashboardUrl}/settings/notifications`}
              style={{ color: '#6b7280', textDecoration: 'underline' }}
            >
              configure suas preferências
            </a>
          </p>
        </div>
      </div>

      {/* Footer Brand */}
      <div
        style={{
          textAlign: 'center',
          padding: '24px',
          fontSize: '12px',
          color: '#6b7280'
        }}
      >
        <p style={{ margin: '0' }}>
          © 2024 MeuAdvogado. Todos os direitos reservados.
        </p>
        <p style={{ margin: '8px 0 0 0' }}>
          Conectando advogados qualificados aos clientes certos.
        </p>
      </div>
    </div>
  )
}
