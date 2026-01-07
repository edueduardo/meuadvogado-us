import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - Dicas Jurídicas para Brasileiros nos EUA',
  description: 'Artigos e dicas sobre imigração, Green Card, acidentes, direito de família e mais. Informação jurídica gratuita em português.',
}

const blogPosts = [
  {
    id: 1,
    slug: 'como-tirar-green-card-2024',
    title: 'Como Tirar Green Card em 2024: Guia Completo para Brasileiros',
    excerpt: 'Tudo que você precisa saber sobre o processo de Green Card nos EUA. Categorias, prazos, custos e dicas de advogados.',
    category: 'Imigração',
    date: '2024-01-15',
    readTime: '12 min',
    image: '🛂',
  },
  {
    id: 2,
    slug: 'acidente-trabalho-direitos-brasileiro',
    title: 'Sofreu Acidente de Trabalho? Seus Direitos como Brasileiro nos EUA',
    excerpt: 'Descubra seus direitos após um acidente de trabalho, mesmo sem documentos. Indenizações podem chegar a milhares de dólares.',
    category: 'Acidentes',
    date: '2024-01-10',
    readTime: '8 min',
    image: '🚗',
  },
  {
    id: 3,
    slug: 'divorcio-eua-brasileiro',
    title: 'Divórcio nos EUA: O Que Todo Brasileiro Precisa Saber',
    excerpt: 'Custódia, pensão, divisão de bens. Entenda como funciona o divórcio americano e proteja seus direitos.',
    category: 'Família',
    date: '2024-01-05',
    readTime: '10 min',
    image: '👨‍👩‍👧',
  },
  {
    id: 4,
    slug: 'parado-policia-dui-o-que-fazer',
    title: 'Fui Parado pela Polícia: O Que Fazer? Guia Anti-DUI',
    excerpt: 'Seus direitos durante uma abordagem policial. Como evitar problemas e o que fazer se for acusado de DUI.',
    category: 'Criminal',
    date: '2024-01-01',
    readTime: '7 min',
    image: '⚖️',
  },
  {
    id: 5,
    slug: 'abrir-empresa-llc-brasileiro',
    title: 'Como Abrir uma LLC nos EUA: Passo a Passo para Brasileiros',
    excerpt: 'Tipos de empresa, custos, impostos e vantagens. Tudo sobre empreender legalmente nos Estados Unidos.',
    category: 'Empresarial',
    date: '2023-12-28',
    readTime: '15 min',
    image: '🏢',
  },
  {
    id: 6,
    slug: 'deportacao-como-evitar',
    title: 'Deportação: Como Evitar e O Que Fazer Se Acontecer',
    excerpt: 'Entenda seus direitos, como se proteger e quais são as opções legais para evitar a deportação.',
    category: 'Imigração',
    date: '2023-12-20',
    readTime: '11 min',
    image: '🛂',
  },
]

const categories = ['Todos', 'Imigração', 'Acidentes', 'Família', 'Criminal', 'Empresarial']

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Blog Jurídico para Brasileiros
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Informação gratuita sobre seus direitos nos EUA. Artigos escritos por advogados brasileiros.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  cat === 'Todos'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group"
              >
                <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform">
                  {post.image}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      {post.category}
                    </span>
                    <span className="text-gray-400 text-xs">{post.readTime} de leitura</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-2">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-green-500 to-emerald-600 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Precisa de Ajuda com seu Caso?
          </h2>
          <p className="text-green-100 mb-6">
            Nossos advogados estão prontos para te ajudar. Consulta gratuita.
          </p>
          <Link
            href="/caso"
            className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
          >
            Falar com Advogado →
          </Link>
        </div>
      </section>
    </div>
  )
}
