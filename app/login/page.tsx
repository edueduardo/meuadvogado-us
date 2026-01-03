'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou senha incorretos')
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="max-w-md mx-auto px-4 w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-blue-600">
            Meu Advogado
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6">Entrar na sua conta</h1>
          <p className="text-gray-600 mt-2">
            Acesse sua área de advogado
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm text-gray-600">Lembrar de mim</span>
            </label>
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Esqueceu a senha?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Não tem conta?{' '}
            <Link href="/cadastro" className="text-blue-600 hover:underline font-medium">
              Cadastre-se como advogado
            </Link>
          </p>

          <p>
            <Link href="/forgot-password" className="text-blue-600 hover:underline text-sm">
              Esqueceu sua senha?
            </Link>
          </p>

          <p>
            <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
              ← Voltar para o início
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
