import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const area = searchParams.get('area');
    const featured = searchParams.get('featured');

    const where: any = {};

    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (state) where.state = { contains: state, mode: 'insensitive' };
    if (area) {
      where.practiceAreas = {
        some: {
          practiceArea: {
            slug: area
          }
        }
      };
    }
    if (featured === 'true') {
      where.user = {
        plan: 'FEATURED'
      };
    }

    const lawyers = await prisma.lawyerProfile.findMany({
      where,
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
        },
        reviews: {
          select: {
            rating: true,
            comment: true,
            reviewerName: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: [
        { user: { plan: 'desc' } },
        { user: { verified: 'desc' } },
        { createdAt: 'asc' }
      ]
    });

    return NextResponse.json({ lawyers });

  } catch (error) {
    console.error('Get lawyers error:', error);
    return NextResponse.json(
      { error: 'Failed to get lawyers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // BLOCKED: Autenticação não implementada
    // TODO: Implementar autenticação real e extrair userId do contexto de usuário logado
    return NextResponse.json(
      { error: 'Endpoint bloqueado: autenticação não está implementada. Implemente o sistema de autenticação para ativar este endpoint.' },
      { status: 401 }
    );

    // Quando autenticação estiver implementada, descomentar:
    // const body = await request.json();
    // const userId = session.user.id; // Extrair de contexto autenticado (NextAuth, etc)
    // const lawyer = await prisma.lawyerProfile.create({
    //   data: {
    //     userId: userId,
    //     ...body
    //   },
    //   include: { ... }
    // });

  } catch (error) {
    console.error('Create lawyer error:', error);
    return NextResponse.json(
      { error: 'Failed to create lawyer' },
      { status: 500 }
    );
  }
}
