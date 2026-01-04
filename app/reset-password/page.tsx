'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'

const passwordSchema = z.string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres')
  .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
  .regex(/[!@#$%^&*]/, 'A senha deve conter pelo menos um caractere especial')

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [tokenError, setTokenError] = useState('')

  useEffect(() => {
    if (!token) {
      setTokenError('Token inválido ou ausente. Solicite um novo reset de senha.')
    }
  }, [token])

  const validatePassword = (password: string): string[] => {
    const result = passwordSchema.safeParse(password)
    if (!result.success) {
      return result.error.errors.map(err => err.message)
    }
    return []
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      setTokenError('Token inválido ou ausente.')
      return
    }

    // Resetar erros
    setErrors([])
    setTokenError('')

    // Validar senhas
    const passwordErrors = validatePassword(formData.newPassword)
    if (passwordErrors.length > 0) {
      setErrors(passwordErrors)
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrors(['As senhas não coincidem'])
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsSuccess(true)
        // Redirecionar após 3 segundos
        setTimeout(() => {
          router.push('/login?message=Senha alterada com sucesso')
        }, 3000)
      } else {
        if (data.details) {
          setErrors(data.details)
        } else {
          setErrors([data.error || 'Erro ao resetar senha'])
        }
      }
    } catch (error) {
      setErrors(['Erro de conexão. Tente novamente.'])
    } finally {
      setIsLoading(false)
    }
  }

  if (tokenError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Token Inválido</h1>
            <p className="text-gray-600 mb-6">{tokenError}</p>
            <Link
              href="/forgot-password"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Solicitar Novo Token
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Senha Alterada!</h1>
            <p className="text-gray-600 mb-6">
              Sua senha foi alterada com sucesso. Você será redirecionado para a página de login em instantes...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resetar Senha</h1>
          <p className="text-gray-600">Digite sua nova senha abaixo</p>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <ul className="text-red-600 text-sm space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Nova Senha
            </label>
            <input
              id="newPassword"
              type="password"
              required
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Nova Senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite a senha novamente"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Processando...' : 'Resetar Senha'}
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

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Requisitos de Senha:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Mínimo 8 caracteres</li>
            <li>• Pelo menos uma letra maiúscula</li>
            <li>• Pelo menos uma letra minúscula</li>
            <li>• Pelo menos um número</li>
            <li>• Pelo menos um caractere especial (!@#$%^&*)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
