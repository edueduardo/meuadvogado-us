'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ACADEMY_VIDEOS, CATEGORIES, AcademyVideo } from '@/lib/academy/videos'

export default function AcademyPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedVideo, setSelectedVideo] = useState<AcademyVideo | null>(null)

  const filteredVideos = selectedCategory === 'ALL' 
    ? ACADEMY_VIDEOS 
    : ACADEMY_VIDEOS.filter(v => v.category === selectedCategory)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/advogado/dashboard"
              className="text-gray-500 hover:text-gray-900 transition"
            >
              ← Voltar
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">🎓 Academy do Advogado</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-6 mb-4">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Todos os Vídeos
          </button>
          {Object.entries(CATEGORIES).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === key
                  ? 'bg-indigo-600 text-white shadow-md'
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
                <span className="text-xs font-semibold text-indigo-600 mb-2 block">
                  {CATEGORIES[video.category]}
                </span>
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition">
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

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">📝</span> Resumo do Conteúdo
                </h3>
                <div className="prose prose-indigo max-w-none text-gray-600 whitespace-pre-wrap font-mono text-sm">
                  {selectedVideo.script}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
