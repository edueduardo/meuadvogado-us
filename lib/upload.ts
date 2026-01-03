import { put, del, list } from '@vercel/blob'

export interface UploadResult {
  url: string
  pathname: string
  contentType: string
  size: number
}

export async function uploadFile(
  file: File,
  folder: string = 'documents'
): Promise<UploadResult> {
  try {
    // Validar tamanho (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. Máximo: 10MB')
    }

    // Validar tipo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ]

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo não permitido. Use: PDF, DOC, DOCX, JPG, PNG')
    }

    // Gerar nome único
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop()
    const filename = `${folder}/${timestamp}-${randomStr}.${extension}`

    // Upload para Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type,
      size: file.size,
    }
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

export async function deleteFile(url: string): Promise<void> {
  try {
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}

export async function listFiles(folder: string = 'documents') {
  try {
    const { blobs } = await list({
      prefix: folder,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    return blobs
  } catch (error) {
    console.error('List error:', error)
    throw error
  }
}
