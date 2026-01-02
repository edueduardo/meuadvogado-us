import { NextResponse } from 'next/server'

const advogados = [
  {
    id: '1',
    nome: 'Dr. João Silva',
    email: 'joao@email.com',
    areas: ['Imigração', 'Família'],
    cidade: 'Miami',
    estado: 'FL',
    avaliacao: 4.9,
    verificado: true,
  },
  {
    id: '2',
    nome: 'Dra. Maria Santos',
    email: 'maria@email.com',
    areas: ['Criminal', 'Acidentes'],
    cidade: 'Orlando',
    estado: 'FL',
    avaliacao: 4.8,
    verificado: true,
  },
]

export async function GET() {
  return NextResponse.json({ advogados })
}

export async function POST(request: Request) {
  const body = await request.json()
  
  // Simular criação
  const novoAdvogado = {
    id: String(advogados.length + 1),
    ...body,
    avaliacao: 0,
    verificado: false,
  }
  
  return NextResponse.json({ advogado: novoAdvogado }, { status: 201 })
}
