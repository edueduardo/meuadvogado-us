import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadFile } from '@/lib/upload'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const caseId = formData.get('caseId') as string
    const conversationId = formData.get('conversationId') as string

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não fornecido' }, { status: 400 })
    }

    // Upload do arquivo
    const result = await uploadFile(file, 'documents')

    // TODO: Salvar no banco de dados após rodar prisma db push
    // const document = await prisma.document.create(...)

    return NextResponse.json({
      success: true,
      document: {
        name: file.name,
        url: result.url,
        type: result.contentType,
        size: result.size,
      },
    })
  } catch (error: any) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer upload' },
      { status: 500 }
    )
  }
}
