'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CLIENT_VIDEOS, CLIENT_CATEGORIES, ClientVideo } from '@/lib/academy/client-videos'

export default function ClientGuidePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedVideo, setSelectedVideo] = useState<ClientVideo | null>(null)

  const filteredVideos = selectedCategory === 'ALL' 
    ? CLIENT_VIDEOS 
    : CLIENT_VIDEOS.filter(v => v.category === selectedCategory)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/cliente/dashboard"
              className="text-gray-500 hover:text-gray-900 transition"
            >
              ← Voltar
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📘 Guia do Imigrante</h1>
              <p className="text-sm text-gray-500">Seus direitos e segurança em primeiro lugar</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Intro Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 mb-8 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Bem-vindo à sua Jornada da Confiança 🛡️</h2>
          <p className="text-blue-100 max-w-2xl">
            Sabemos que lidar com questões legais nos EUA pode ser assustador. 
            Preparamos estes vídeos rápidos para te explicar como o sistema funciona e como nós protegemos você.
          </p>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-6 mb-4">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Todos os Guias
          </button>
          {Object.entries(CLIENT_CATEGORIES).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div 
              key={video.id}
              onClick={() => setSelectedVideo(video)}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition cursor-pointer group border border-gray-100 overflow-hidden"
            >
              {/* Thumbnail Placeholder */}
              <div className={`aspect-video bg-gradient-to-br ${video.thumbnailColor} relative flex items-center justify-center`}>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
                <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </span>
              </div>

              <div className="p-5">
                <span className="text-xs font-semibold text-blue-600 mb-2 block">
                  {CLIENT_CATEGORIES[video.category]}
                </span>
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {video.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="aspect-video bg-black flex items-center justify-center relative group">
              {/* Fake Player */}
              <div className={`absolute inset-0 bg-gradient-to-br ${selectedVideo.thumbnailColor} opacity-20`}></div>
              <button 
                className="bg-white/10 hover:bg-white/20 w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 z-10"
              >
                <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </button>
              <p className="absolute bottom-8 text-white font-medium opacity-60">
                (Simulação de Player de Vídeo)
              </p>
            </div>
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedVideo.title}</h2>
                  <p className="text-gray-600">{selectedVideo.description}</p>
                </div>
                <button 
                  onClick={() => setSelectedVideo(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">🎙️</span> Transcrição do Vídeo
                </h3>
                <div className="prose prose-blue max-w-none text-gray-600 whitespace-pre-wrap font-mono text-sm">
                  {selectedVideo.script}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Link
                  href="/caso"
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-bold shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Entendi! Quero buscar um advogado agora →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
