'use client'

import { useState } from 'react'
import Link from 'next/link'
import { z } from 'zod'

const emailSchema = z.string().email('Email inválido')

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validar email
    const validation = emailSchema.safeParse(email)
    if (!validation.success) {
      setError('Por favor, digite um email válido.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsSuccess(true)
      } else {
        setError(data.error || 'Erro ao solicitar reset de senha')
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✉️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Enviado!</h1>
            <p className="text-gray-600 mb-6">
              Enviamos instruções para resetar sua senha para:<br />
              <strong>{email}</strong>
            </p>
            <div className="space-y-4 text-sm text-gray-500">
              <p>• Verifique sua caixa de entrada</p>
              <p>• Verifique também a pasta de spam</p>
              <p>• O link expira em 2 horas por segurança</p>
            </div>
            <div className="mt-8 space-y-4">
              <button
                onClick={() => setIsSuccess(false)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Enviar Novamente
              </button>
              <Link
                href="/login"
                className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-semibold text-center"
              >
                Voltar para Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-blue-600">Meu Advogado</h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">Esqueceu a Senha?</h2>
          <p className="text-gray-600">
            Digite seu email e enviaremos instruções para resetar sua senha
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="seu@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Enviando...' : 'Enviar Instruções'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Lembrou sua senha?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Fazer Login
            </Link>
          </p>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">🔐 Segurança Garantida</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Links de reset expiram em 2 horas</li>
            <li>• Tokens únicos e seguros</li>
            <li>• Máximo de 3 tentativas por token</li>
            <li>• Notificação de alteração de senha</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
