'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { quizQuestions, calculateQuizResult, type QuizResult } from '@/lib/quiz/quiz-scoring'

export default function CaseSuccessQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [result, setResult] = useState<QuizResult | null>(null)

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = {
      ...answers,
      [quizQuestions[currentQuestion].id]: answerIndex
    }
    setAnswers(newAnswers)

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      const quizResult = calculateQuizResult(newAnswers)
      setResult(quizResult)
    }
  }

  const getProgressPercentage = () => {
    return ((currentQuestion) / quizQuestions.length) * 100
  }

  if (result) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-8 text-white max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-2">Resultado do Seu Caso</h2>
        <p className="text-gray-400 mb-8">Análise baseada em suas respostas</p>

        <div className="bg-white/10 rounded-lg p-8 mb-8 text-center">
          <div className="text-6xl font-bold text-blue-400 mb-2">
            {result.successProbability}%
          </div>
          <div className="text-xl text-gray-300">Chance de Sucesso Estimada</div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className={`p-4 rounded-lg text-center ${
            result.complexity === 'low' ? 'bg-green-500/20 border border-green-500' :
            result.complexity === 'medium' ? 'bg-yellow-500/20 border border-yellow-500' :
            'bg-red-500/20 border border-red-500'
          }`}>
            <div className="text-sm text-gray-300">Complexidade</div>
            <div className="text-lg font-bold capitalize">{result.complexity}</div>
          </div>

          <div className="p-4 rounded-lg text-center bg-purple-500/20 border border-purple-500">
            <div className="text-sm text-gray-300">Especialista</div>
            <div className="text-sm font-bold">Imigração</div>
          </div>

          <div className="p-4 rounded-lg text-center bg-blue-500/20 border border-blue-500">
            <div className="text-sm text-gray-300">Timeline</div>
            <div className="text-sm font-bold">2-6 meses</div>
          </div>
        </div>

        <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-6 mb-8">
          <h3 className="font-bold mb-2">Recomendação</h3>
          <p className="text-gray-200">{result.recommendation}</p>
        </div>

        <a
          href="/caso"
          className="block text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white font-bold hover:shadow-lg transition"
        >
          Falar com Especialista Verificado
        </a>

        <button
          onClick={() => {
            setResult(null)
            setCurrentQuestion(0)
            setAnswers({})
          }}
          className="w-full mt-4 text-gray-400 hover:text-white transition text-sm"
        >
          ← Fazer Quiz Novamente
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-8 text-white max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Qual sua Chance de Sucesso?</h2>
        <p className="text-gray-400">Quiz rápido (2 min) para estimar seu caso</p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">
            Pergunta {currentQuestion + 1} de {quizQuestions.length}
          </span>
          <span className="text-sm font-bold text-blue-400">{getProgressPercentage().toFixed(0)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      <div className="mb-8">
        <div className="text-blue-400 text-sm font-semibold mb-2 uppercase">
          {quizQuestions[currentQuestion].category}
        </div>
        <h3 className="text-2xl font-bold mb-6">
          {quizQuestions[currentQuestion].question}
        </h3>
      </div>

      <div className="space-y-3 mb-8">
        {quizQuestions[currentQuestion].answers.map((answer, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(idx)}
            className={`w-full p-4 rounded-lg transition border-2 text-left flex items-center justify-between group ${
              answers[quizQuestions[currentQuestion].id] === idx
                ? 'border-blue-500 bg-blue-500/20'
                : 'border-gray-600 bg-gray-800/50 hover:border-blue-400'
            }`}
          >
            <span className="font-medium">{answer.text}</span>
            <ChevronRight className="text-gray-400 group-hover:text-blue-400 transition" size={20} />
          </button>
        ))}
      </div>

      <div className="text-center text-xs text-gray-500">
        Suas respostas são anônimas e não serão salvas
      </div>
    </div>
  )
}
