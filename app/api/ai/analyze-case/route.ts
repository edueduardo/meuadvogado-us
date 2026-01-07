// app/api/ai/analyze-case/route.ts
// Endpoint para análise de caso com IA

import { NextRequest, NextResponse } from 'next/server'
import { claudeService } from '@/lib/ai/claude-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { description } = body

    if (!description || description.length < 20) {
      return NextResponse.json(
        { error: 'Descrição do caso muito curta. Forneça mais detalhes.' },
        { status: 400 }
      )
    }

    const analysis = await claudeService.analyzeCase(description)

    if (!analysis) {
      return NextResponse.json(
        { error: 'Não foi possível analisar o caso' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      analysis,
      aiConfigured: claudeService.isConfigured(),
    })

  } catch (error: any) {
    console.error('Error analyzing case:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao analisar caso' },
      { status: 500 }
    )
  }
}
