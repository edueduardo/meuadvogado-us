'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, AlertCircle } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  specialty?: string
  isComplex?: boolean
}

export default function LegalCopilot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Eu sou seu assistente jurídico. Posso responder perguntas básicas sobre imigração, vistos, green card e direitos nos EUA. Como posso ajudar?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.reply,
          specialty: data.recommendedSpecialty,
          isComplex: data.isComplex
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Desculpe, ocorreu um erro. Por favor, tente novamente.'
        }])
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro de conexão. Por favor, tente novamente.'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all"
        aria-label="Open legal copilot"
      >
        <MessageCircle size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 z-40 bg-white rounded-lg shadow-2xl border border-gray-200 w-96 max-h-96 flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold">Assistente Jurídico</h3>
              <p className="text-xs opacity-90">24/7 - Respostas instantâneas</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>

                  {msg.isComplex && (
                    <div className="mt-2 pt-2 border-t border-current opacity-75 flex items-center gap-1 text-xs">
                      <AlertCircle size={14} />
                      <span>Caso complexo - recomendo falar com advogado</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Digite sua pergunta..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <Send size={18} />
            </button>
          </div>

          <div className="px-3 py-2 bg-yellow-50 border-t border-yellow-200 text-xs text-gray-600">
            ⚠️ Isto não é aconselhamento jurídico. Consulte um advogado verificado para orientação oficial.
          </div>
        </div>
      )}
    </>
  )
}
