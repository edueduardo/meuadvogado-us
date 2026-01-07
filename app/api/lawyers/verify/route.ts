// app/api/lawyers/verify/route.ts
// API para verificação de licença de advogados

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  barVerificationService, 
  US_STATE_BARS, 
  USLicenseType,
  VerificationStatus,
  VERIFICATION_DISCLAIMERS 
} from '@/lib/verification/bar-verification'

// POST - Submeter licença para verificação
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { 
      usLicense,           // Licença americana (obrigatório)
      internationalLicense // Licença internacional (opcional)
    } = body

    // Validar licença americana obrigatória
    if (!usLicense || !usLicense.state || !usLicense.barNumber) {
      return NextResponse.json(
        { 
          error: 'Licença americana (Bar) é obrigatória',
          message: 'Para atuar nos Estados Unidos, você deve ter uma licença válida de pelo menos um estado americano.'
        },
        { status: 400 }
      )
    }

    // Validar estado
    if (!US_STATE_BARS[usLicense.state]) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      )
    }

    // Validar formato do Bar Number
    if (!barVerificationService.validateBarNumberFormat(usLicense.state, usLicense.barNumber)) {
      return NextResponse.json(
        { error: 'Formato do Bar Number inválido' },
        { status: 400 }
      )
    }

    // Buscar advogado
    const lawyer = await prisma.lawyer.findFirst({
      where: { userId: session.user.id }
    })

    if (!lawyer) {
      return NextResponse.json(
        { error: 'Perfil de advogado não encontrado' },
        { status: 404 }
      )
    }

    // Criar solicitação de verificação
    const verificationRequest = barVerificationService.createVerificationRequest(
      lawyer.id,
      {
        state: usLicense.state,
        barNumber: usLicense.barNumber,
        licenseType: usLicense.licenseType || USLicenseType.FULL_ATTORNEY,
        admissionDate: usLicense.admissionDate,
      }
    )

    // Salvar no banco (usando JSON field para flexibilidade)
    await prisma.lawyer.update({
      where: { id: lawyer.id },
      data: {
        barNumber: usLicense.barNumber,
        barState: usLicense.state,
        verificationStatus: VerificationStatus.PENDING,
        // Salvar dados completos em campo JSON
        verificationData: JSON.stringify({
          usLicenses: [verificationRequest],
          internationalLicenses: internationalLicense ? [
            barVerificationService.createInternationalLicense(
              internationalLicense.country,
              internationalLicense.organization,
              internationalLicense.registrationNumber,
              internationalLicense.state
            )
          ] : [],
          submittedAt: new Date().toISOString(),
        }),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Solicitação de verificação enviada com sucesso',
      verificationRequest,
      lookupUrl: barVerificationService.getPublicVerificationUrl(
        usLicense.state, 
        usLicense.barNumber
      ),
      disclaimer: VERIFICATION_DISCLAIMERS.US_LICENSE,
      internationalDisclaimer: internationalLicense 
        ? VERIFICATION_DISCLAIMERS.INTERNATIONAL_LICENSE 
        : null,
    })

  } catch (error: any) {
    console.error('Error submitting verification:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao enviar verificação' },
      { status: 500 }
    )
  }
}

// GET - Obter status de verificação
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const lawyer = await prisma.lawyer.findFirst({
      where: { userId: session.user.id },
      select: {
        id: true,
        barNumber: true,
        barState: true,
        verified: true,
        verificationStatus: true,
        verificationData: true,
      },
    })

    if (!lawyer) {
      return NextResponse.json(
        { error: 'Perfil de advogado não encontrado' },
        { status: 404 }
      )
    }

    const verificationData = lawyer.verificationData 
      ? JSON.parse(lawyer.verificationData as string) 
      : null

    return NextResponse.json({
      success: true,
      verification: {
        isVerified: lawyer.verified,
        status: lawyer.verificationStatus || VerificationStatus.PENDING,
        barNumber: lawyer.barNumber,
        barState: lawyer.barState,
        usLicenses: verificationData?.usLicenses || [],
        internationalLicenses: verificationData?.internationalLicenses || [],
        lookupUrl: lawyer.barState 
          ? barVerificationService.getPublicVerificationUrl(lawyer.barState, lawyer.barNumber || '')
          : null,
      },
      states: US_STATE_BARS,
      disclaimers: VERIFICATION_DISCLAIMERS,
    })

  } catch (error: any) {
    console.error('Error fetching verification:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar verificação' },
      { status: 500 }
    )
  }
}
