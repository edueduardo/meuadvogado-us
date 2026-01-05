// app/api/consultations/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Types
interface CreateConsultationRequest {
  lawyerId: string;
  startTime: string; // ISO string
  duration: number; // minutes
  type: "VIDEO" | "PHONE" | "IN_PERSON";
  notes?: string;
}

interface CreateConsultationResponse {
  consultationId: string;
  jitsiLink: string;
  startTime: string;
  duration: number;
  status: string;
}

// Validation schema
const createConsultationSchema = z.object({
  lawyerId: z.string().min(1, "ID do advogado obrigatório"),
  startTime: z.string().datetime("Data/hora inválida"),
  duration: z.number().min(15).max(480, "Duração deve ser entre 15min e 8h"),
  type: z.enum(["VIDEO", "PHONE", "IN_PERSON"]),
  notes: z.string().optional(),
});

// Jitsi Service (inline para evitar dependência externa)
class JitsiService {
  private baseUrl = "https://meet.jit.si";
  
  generateMeetingRoom(consultationId: string): string {
    // Gera room name único e seguro
    const roomName = `meuadvogado-${consultationId}-${Date.now()}`;
    return `${this.baseUrl}/${roomName}`;
  }
  
  generateJitsiLink(consultationId: string, lawyerName: string, clientName: string): string {
    const roomName = `meuadvogado-${consultationId}`;
    const params = new URLSearchParams({
      config: `prejoinPageEnabled=false&startWithAudioMuted=false&startWithVideoMuted=false`,
      userInfo: `{"displayName":"${clientName}"}`
    });
    return `${this.baseUrl}/${roomName}?${params.toString()}`;
  }
}

const jitsiService = new JitsiService();

// Rate limiting simples (em produção usar Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string, limit: number = 5, windowMs: number = 3600000): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= limit) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Autenticação
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 2. Rate limiting
    if (!checkRateLimit(user.id)) {
      return NextResponse.json({ error: "Limite de consultas excedido" }, { status: 429 });
    }

    // 3. Parse e validação do body
    const body = await req.json();
    const validatedData = createConsultationSchema.parse(body);
    
    const { lawyerId, startTime, duration, type, notes } = validatedData;

    // 4. Verificar se advogado existe
    const lawyer = await prisma.lawyer.findUnique({
      where: { id: lawyerId },
      include: { user: { select: { name: true } } }
    });

    if (!lawyer) {
      return NextResponse.json({ error: "Advogado não encontrado" }, { status: 404 });
    }

    // 5. Verificar se cliente existe (se não for advogado criando)
    let client = null;
    if (user.role === "CLIENT") {
      client = await prisma.client.findUnique({
        where: { userId: user.id },
        include: { user: { select: { name: true } } }
      });

      if (!client) {
        return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
      }
    }

    // 6. Validar horário (não pode ser no passado)
    const consultationStart = new Date(startTime);
    const now = new Date();
    
    if (consultationStart <= now) {
      return NextResponse.json({ error: "Data/hora deve ser no futuro" }, { status: 400 });
    }

    // 7. Verificar disponibilidade do advogado
    const existingConsultation = await prisma.consultation.findFirst({
      where: {
        lawyerId,
        status: { in: ["scheduled", "in_progress"] },
        scheduledAt: {
          gte: new Date(consultationStart.getTime() - duration * 60000), // 1 hora antes
          lte: new Date(consultationStart.getTime() + duration * 60000), // 1 hora depois
        }
      }
    });

    if (existingConsultation) {
      return NextResponse.json({ error: "Advogado não está disponível neste horário" }, { status: 409 });
    }

    // 8. Criar consulta no banco
    const consultation = await prisma.consultation.create({
      data: {
        lawyerId,
        clientId: client?.id,
        scheduledAt: consultationStart,
        duration,
        consultationType: type,
        status: "scheduled",
        notes,
        meetingLink: type === "VIDEO" ? "" : null,
        price: 0,
      }
    });

    // 9. Gerar link Jitsi (se for video)
    let jitsiLink = null;
    if (type === "VIDEO") {
      const displayName = user.role === "CLIENT" 
        ? client?.user?.name || "Cliente"
        : lawyer.user.name || "Advogado";
      
      jitsiLink = jitsiService.generateJitsiLink(
        consultation.id,
        lawyer.user.name || "Advogado",
        displayName
      );

      // Atualizar consulta com o link
      await prisma.consultation.update({
        where: { id: consultation.id },
        data: { meetingLink: jitsiLink }
      });
    }

    // 10. Log estruturado
    console.log("Consulta criada:", {
      consultationId: consultation.id,
      lawyerId,
      clientId: client?.id,
      type,
      startTime: consultation.scheduledAt,
      createdBy: user.role,
      hasVideoLink: !!jitsiLink
    });

    // 11. Retornar resposta
    const response: CreateConsultationResponse = {
      consultationId: consultation.id,
      jitsiLink: jitsiLink || "",
      startTime: consultation.scheduledAt.toISOString(),
      duration,
      status: consultation.status
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar consulta:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Dados inválidos", 
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: "Erro interno ao criar consulta" 
    }, { status: 500 });
  }
}

// GET endpoint para listar consultas do usuário
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    
    let consultations;
    
    if (user.role === "LAWYER") {
      const lawyer = await prisma.lawyer.findUnique({
        where: { userId: user.id }
      });
      
      if (!lawyer) {
        return NextResponse.json({ error: "Advogado não encontrado" }, { status: 404 });
      }

      consultations = await prisma.consultation.findMany({
        where: {
          lawyerId: lawyer.id,
          ...(status && { status: status as any })
        },
        include: {
          client: {
            include: {
              user: { select: { name: true, email: true } }
            }
          }
        },
        orderBy: { scheduledAt: "desc" }
      });
    } else {
      const client = await prisma.client.findUnique({
        where: { userId: user.id }
      });
      
      if (!client) {
        return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
      }

      consultations = await prisma.consultation.findMany({
        where: {
          clientId: client.id,
          ...(status && { status: status as any })
        },
        include: {
          lawyer: {
            include: {
              user: { select: { name: true, email: true } }
            }
          }
        },
        orderBy: { scheduledAt: "desc" }
      });
    }

    return NextResponse.json({ consultations });
    
  } catch (error) {
    console.error("Erro ao listar consultas:", error);
    return NextResponse.json({ 
      error: "Erro interno ao buscar consultas" 
    }, { status: 500 });
  }
}
