// app/api/caso/submit/route.ts
// API pública para submit de casos (sem autenticação)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeCase } from "@/lib/ai";
import { calculateLeadQualityScore, notifyLawyers } from "@/lib/matching";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, city, state, practiceArea, description } = body;

    // Validações
    if (!name || !phone || !practiceArea || !description) {
      return NextResponse.json(
        { error: "Campos obrigatórios: nome, telefone, área e descrição" },
        { status: 400 }
      );
    }

    if (description.length < 50) {
      return NextResponse.json(
        { error: "A descrição deve ter pelo menos 50 caracteres" },
        { status: 400 }
      );
    }

    // Buscar área de atuação
    const area = await prisma.practiceArea.findFirst({
      where: { slug: practiceArea },
    });

    if (!area) {
      return NextResponse.json(
        { error: "Área de atuação inválida" },
        { status: 400 }
      );
    }

    // Calcular quality score do lead
    const qualityScore = calculateLeadQualityScore({
      descriptionLength: description.length,
      hasEmail: !!email,
      phoneVerified: false, // TODO: Implementar verificação SMS
      hasAdditionalInfo: false,
    });

    // Criar o caso
    const newCase = await prisma.case.create({
      data: {
        contactName: name,
        contactPhone: phone,
        contactEmail: email || null,
        contactCity: city || null,
        contactState: state || null,
        practiceAreaId: area.id,
        description,
        status: "NEW",
        qualityScore,
      },
    });

    // Iniciar análise por IA (async - não bloqueia resposta)
    analyzeCaseAsync(newCase.id, description, practiceArea, city, state);

    return NextResponse.json(
      {
        success: true,
        caseId: newCase.id,
        message: "Caso recebido! A análise será enviada em breve.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Case submit error:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar caso" },
      { status: 500 }
    );
  }
}

// Função async para analisar o caso (não bloqueia a resposta)
async function analyzeCaseAsync(
  caseId: string,
  description: string,
  practiceArea: string,
  city?: string,
  state?: string
) {
  try {
    // Atualizar status para "analyzing"
    await prisma.case.update({
      where: { id: caseId },
      data: { status: "ANALYZING" },
    });

    // Executar análise por IA
    const analysis = await analyzeCase({
      description,
      practiceArea,
      clientCity: city,
      clientState: state,
    });

    // Salvar análise no banco
    await prisma.caseAnalysis.create({
      data: {
        caseId,
        summary: analysis.summary,
        suggestedArea: analysis.suggestedArea,
        urgency: analysis.urgency,
        complexity: analysis.complexity,
        keyIssues: analysis.keyIssues,
        potentialChallenges: analysis.potentialChallenges,
        recommendedActions: analysis.recommendedActions,
        estimatedCostMin: analysis.estimatedCostMin,
        estimatedCostMax: analysis.estimatedCostMax,
        estimatedTimeline: analysis.estimatedTimeline,
        successProbability: analysis.successProbability,
        aiModel: "claude-3-5-sonnet-20241022",
        tokensUsed: analysis.tokensUsed,
        rawResponse: analysis.rawResponse,
        disclaimer: analysis.disclaimer,
      },
    });

    // Atualizar caso com título e status
    await prisma.case.update({
      where: { id: caseId },
      data: {
        title: analysis.title,
        status: "ANALYZED",
      },
    });

    // Notificar advogados FEATURED imediatamente
    await notifyLawyers(caseId, "featured");

    // Agendar notificação PREMIUM para 2 horas depois (TODO: usar queue)
    // Agendar notificação FREE para 24 horas depois (TODO: usar queue)

    console.log(`✅ Case ${caseId} analyzed successfully`);
  } catch (error) {
    console.error(`❌ Error analyzing case ${caseId}:`, error);
    
    // Marcar como erro
    await prisma.case.update({
      where: { id: caseId },
      data: { status: "NEW" },
    });
  }
}
