import { NextRequest, NextResponse } from 'next/server';
import { analyzeLegalCase } from '@/lib/ai';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const caseSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  caseType: z.string(),
  description: z.string().min(10),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = caseSchema.parse(body);
    
    // Salvar caso
    const newCase = await prisma.case.create({
      data: validatedData,
    });
    
    // Analisar com IA
    const aiAnalysis = await analyzeLegalCase(validatedData.description);
    
    // Atualizar com análise
    await prisma.case.update({
      where: { id: newCase.id },
      data: { 
        aiAnalysis,
        status: 'analyzed'
      },
    });
    
    // Buscar advogados relevantes
    const relevantLawyers = await prisma.lawyerProfile.findMany({
      where: {
        practiceAreas: {
          some: {
            practiceArea: {
              name: {
                contains: validatedData.caseType,
                mode: 'insensitive'
              }
            }
          }
        },
        user: {
          plan: {
            in: ['PREMIUM', 'FEATURED']
          }
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            photo: true,
            plan: true,
            verified: true
          }
        },
        practiceAreas: {
          include: {
            practiceArea: true
          }
        }
      },
      take: 5,
    });
    
    return NextResponse.json({
      success: true,
      case: newCase,
      analysis: aiAnalysis,
      lawyers: relevantLawyers,
    });
    
  } catch (error) {
    console.error('Case submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit case' },
      { status: 500 }
    );
  }
}
