import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  
  const { nome, telefone, email, cidade, estado, area, descricao, urgencia } = body
  
  // Validação básica
  if (!nome || !telefone || !cidade || !estado || !area || !descricao) {
    return NextResponse.json(
      { error: 'Campos obrigatórios não preenchidos' },
      { status: 400 }
    )
  }
  
  if (descricao.length < 50) {
    return NextResponse.json(
      { error: 'Descrição deve ter pelo menos 50 caracteres' },
      { status: 400 }
    )
  }
  
  // Simular salvamento do caso
  const caso = {
    id: `caso_${Date.now()}`,
    nome,
    telefone,
    email,
    cidade,
    estado,
    area,
    descricao,
    urgencia: urgencia || 'media',
    status: 'novo',
    criadoEm: new Date().toISOString(),
  }
  
  // Aqui seria feita a análise por IA e match com advogados
  
  return NextResponse.json({ 
    success: true,
    caso,
    message: 'Caso recebido com sucesso! Em breve entraremos em contato.'
  }, { status: 201 })
}
