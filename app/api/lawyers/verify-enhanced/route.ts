// app/api/lawyers/verify-enhanced/route.ts
// Enhanced Bar Verification with state-specific lookups (NY, CA, FL, TX)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  barVerificationService,
  VerificationStatus,
  US_STATE_BARS,
} from '@/lib/verification/bar-verification';
import { StateLookupHub, MajorStatesStats } from '@/lib/verification/state-bar-lookup';

interface VerificationRequest {
  lawyerId: string;
  state: string;
  barNumber: string;
  lawyerName?: string;
  licenseType?: 'FULL_ATTORNEY' | 'FLC' | 'AHC' | 'LIMITED';
}

interface VerificationResponse {
  success: boolean;
  lawyerId: string;
  state: string;
  barNumber: string;
  verified: boolean;
  status: string;
  lookupUrl: string;
  isMajorState: boolean;
  message: string;
  timestamp: string;
  recommendations?: string[];
}

/**
 * POST /api/lawyers/verify-enhanced
 * Enhanced verification with state-specific lookups
 */
export async function POST(req: NextRequest) {
  try {
    const body: VerificationRequest = await req.json();
    const { lawyerId, state, barNumber, lawyerName, licenseType } = body;

    // Validate required fields
    if (!lawyerId || !state || !barNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: lawyerId, state, barNumber' },
        { status: 400 }
      );
    }

    const normalizedState = state.toUpperCase();

    // Check if state is valid
    if (!US_STATE_BARS[normalizedState]) {
      return NextResponse.json(
        { error: `Invalid US state: ${state}` },
        { status: 400 }
      );
    }

    console.log('🔍 Enhanced Bar Verification:', {
      lawyerId,
      state: normalizedState,
      barNumber,
      isMajorState: MajorStatesStats.isMajorState(normalizedState),
    });

    // Check if it's a major state (NY, CA, FL, TX) with enhanced lookup
    const isMajorState = MajorStatesStats.isMajorState(normalizedState);
    let verificationResult: any = {};

    if (isMajorState) {
      // Use state-specific lookup
      console.log(`📍 Using enhanced lookup for major state: ${normalizedState}`);

      verificationResult = await StateLookupHub.verifyBarNumber(
        normalizedState,
        barNumber,
        lawyerName
      );
    } else {
      // Use generic BAR format validation
      console.log(`📍 Using generic validation for state: ${normalizedState}`);

      const isValidFormat = barVerificationService.validateBarNumberFormat(
        normalizedState,
        barNumber
      );

      verificationResult = {
        verified: isValidFormat,
        state: normalizedState,
        barNumber,
        status: 'PENDING_MANUAL_REVIEW',
        lookupUrl: US_STATE_BARS[normalizedState]?.lookupUrl || '',
        message: isValidFormat
          ? `Bar number format válido. Verificação manual necessária. Visite: ${US_STATE_BARS[normalizedState]?.barUrl}`
          : 'Formato de bar number inválido para este estado.',
      };
    }

    // Create verification record in database
    const lawyer = await prisma.lawyer.findUnique({
      where: { id: lawyerId },
    });

    if (!lawyer) {
      return NextResponse.json(
        { error: 'Lawyer not found' },
        { status: 404 }
      );
    }

    // Generate recommendations
    const recommendations: string[] = [];

    if (isMajorState) {
      recommendations.push(`✓ ${normalizedState} é um dos maiores mercados jurídicos dos EUA`);
      const majorState = MajorStatesStats.getMajorState(normalizedState);
      if (majorState) {
        recommendations.push(
          `📊 ${majorState.name}: ~${majorState.lawyerCount.toLocaleString()} advogados ativos`
        );
      }
    }

    if (verificationResult.verified) {
      recommendations.push('✅ Seu bar number foi validado com sucesso');
      recommendations.push('🎯 Você já pode receber leads neste estado');
      recommendations.push('💰 Seu perfil será destacado para clientes em ' + normalizedState);
    } else {
      recommendations.push(
        `⚠️ Por favor, verifique seu bar number em: ${verificationResult.lookupUrl}`
      );
      if (isMajorState) {
        recommendations.push(
          '📋 Verificação manual pela nossa equipe (24-48 horas)'
        );
      }
    }

    const response: VerificationResponse = {
      success: true,
      lawyerId,
      state: normalizedState,
      barNumber: verificationResult.barNumber || barNumber,
      verified: verificationResult.verified,
      status: verificationResult.status || VerificationStatus.PENDING,
      lookupUrl: verificationResult.lookupUrl,
      isMajorState,
      message: verificationResult.message,
      timestamp: new Date().toISOString(),
      recommendations,
    };

    console.log('✅ Enhanced Verification Result:', {
      state: normalizedState,
      verified: verificationResult.verified,
      isMajorState,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Enhanced verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify bar license' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/lawyers/verify-enhanced?state=CA
 * Get verification info for a state
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const state = searchParams.get('state')?.toUpperCase();

    if (!state) {
      return NextResponse.json(
        { error: 'state parameter required' },
        { status: 400 }
      );
    }

    if (!US_STATE_BARS[state]) {
      return NextResponse.json(
        { error: `Invalid state: ${state}` },
        { status: 400 }
      );
    }

    const isMajorState = MajorStatesStats.isMajorState(state);
    const stateLookup = StateLookupHub.getStateLookup(state);
    const stateBar = US_STATE_BARS[state];
    const majorStateInfo = MajorStatesStats.getMajorState(state);

    return NextResponse.json({
      state,
      stateName: stateBar?.fullName,
      isMajorState,
      lookupUrl: stateBar?.lookupUrl,
      directLookupAvailable: !!stateLookup,
      directLookupUrl: stateLookup?.lookupUrl || null,
      majorStateStats: majorStateInfo || null,
      instructions: isMajorState
        ? `🚀 Verificação rápida disponível. Seu bar number será validado em tempo real.`
        : `ℹ️ Por favor, verifique seu bar number no site do ${stateBar?.fullName}`,
      barUrl: stateBar?.barUrl,
    });
  } catch (error) {
    console.error('❌ State info error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch state info' },
      { status: 500 }
    );
  }
}
