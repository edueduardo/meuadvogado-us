'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError('Token não fornecido')
      return
    }

    // Chamar GET /api/auth/verify?token={token}
    fetch(`/api/auth/verify?token=${token}`)
      .then(res => {
        if (res.ok) {
          setStatus('success')
        } else {
          return res.json().then(data => {
            throw new Error(data.error)
          })
        }
      })
      .catch(err => {
        setStatus('error')
        setError(err.message)
      })
  }, [token])

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Verificando seu email...</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center border-t-4 border-green-500">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900">Email verificado com sucesso!</h1>
            <p className="text-gray-600 mt-4">Sua conta está ativa e pronta para usar.</p>
            <Link href="/login" className="inline-block mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Ir para Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8 text-center border-t-4 border-red-500">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900">Erro na verificação</h1>
          <p className="text-red-600 mt-4">{error}</p>
          <Link href="/auth/resend-verification" className="inline-block mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Reenviar Email
          </Link>
        </div>
      </div>
    </div>
  )
}
