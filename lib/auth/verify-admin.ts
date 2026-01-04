import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function verifyAdmin() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Não autenticado' },
      { status: 401 }
    )
  }
  
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Acesso negado - requer role ADMIN' },
      { status: 403 }
    )
  }
  
  return null // null = permitido
}
