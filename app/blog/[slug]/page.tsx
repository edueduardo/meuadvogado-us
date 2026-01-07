import Link from 'next/link'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

const blogPosts: Record<string, {
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
  image: string
  content: string
}> = {
  'como-tirar-green-card-2024': {
    title: 'Como Tirar Green Card em 2024: Guia Completo para Brasileiros',
    excerpt: 'Tudo que você precisa saber sobre o processo de Green Card nos EUA.',
    category: 'Imigração',
    date: '2024-01-15',
    readTime: '12 min',
    image: '🛂',
    content: `
## O Que é o Green Card?

O Green Card (oficialmente chamado de "Permanent Resident Card") é o documento que autoriza um estrangeiro a viver e trabalhar permanentemente nos Estados Unidos.

## Principais Categorias de Green Card

### 1. Green Card por Família
- Cônjuge de cidadão americano
- Filhos de cidadãos americanos
- Pais de cidadãos americanos (quando o filho tem 21+)
- Irmãos de cidadãos americanos

### 2. Green Card por Trabalho (EB)
- **EB-1**: Profissionais extraordinários
- **EB-2**: Profissionais com grau avançado
- **EB-3**: Trabalhadores qualificados
- **EB-5**: Investidores ($800k - $1M)

### 3. Loteria do Green Card (DV)
Brasileiros são elegíveis! Inscrição gratuita anualmente.

## Custos Médios

| Tipo | Custo Advogado | Taxas USCIS |
|------|---------------|-------------|
| Família | $2,500 - $5,000 | $1,760 |
| EB-2/EB-3 | $5,000 - $10,000 | $2,500+ |
| EB-5 | $25,000+ | $3,675 |

## Tempo de Processamento

- **Cônjuge de cidadão**: 12-24 meses
- **EB-2/EB-3**: 2-5 anos (backlog brasileiro)
- **Loteria**: 1-2 anos após seleção

## Dicas Importantes

1. **Nunca minta** em formulários de imigração
2. **Guarde todos os documentos** organizados
3. **Contrate um advogado** de imigração experiente
4. **Mantenha status legal** durante o processo

## Próximos Passos

Precisa de ajuda com seu caso de Green Card? Nossos advogados brasileiros especializados em imigração podem te orientar.
    `,
  },
  'acidente-trabalho-direitos-brasileiro': {
    title: 'Sofreu Acidente de Trabalho? Seus Direitos como Brasileiro nos EUA',
    excerpt: 'Descubra seus direitos após um acidente de trabalho.',
    category: 'Acidentes',
    date: '2024-01-10',
    readTime: '8 min',
    image: '🚗',
    content: `
## Seus Direitos São Garantidos

**Importante:** Você tem direitos mesmo sem documentos! A lei americana protege TODOS os trabalhadores.

## Workers' Compensation

Na maioria dos estados, seu empregador é obrigado a ter seguro de acidentes (Workers' Comp). Isso cobre:

- ✅ Despesas médicas
- ✅ Salários perdidos
- ✅ Reabilitação
- ✅ Indenização por incapacidade

## O Que Fazer Após um Acidente

### Imediatamente:
1. **Procure atendimento médico**
2. **Reporte ao supervisor** (por escrito se possível)
3. **Documente tudo** (fotos, testemunhas)
4. **Guarde todos os recibos**

### Nos primeiros 30 dias:
1. **Preencha formulário de acidente**
2. **Consulte um advogado** (consulta gratuita)
3. **Não assine nada** da empresa sem advogado

## Valores de Indenização

| Tipo de Lesão | Valor Médio |
|---------------|-------------|
| Lesão leve | $10,000 - $25,000 |
| Fratura | $30,000 - $75,000 |
| Lesão grave | $100,000 - $500,000 |
| Incapacidade permanente | $500,000+ |

## IMPORTANTE: Contingência

A maioria dos advogados de acidentes trabalha em **contingência**, ou seja:
- **Você não paga nada adiantado**
- Advogado só recebe se você ganhar
- Geralmente 33% do valor recuperado

## Prazos Legais

⚠️ **Atenção aos prazos!**
- Florida: 2 anos
- California: 2 anos
- New York: 3 anos
- Texas: 2 anos

Não perca seu direito! Consulte um advogado agora.
    `,
  },
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts[slug]
  
  if (!post) {
    return { title: 'Artigo não encontrado' }
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = blogPosts[slug]

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/blog" className="text-blue-200 hover:text-white mb-4 inline-block">
            ← Voltar para Blog
          </Link>
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">
              {post.category}
            </span>
            <span className="text-blue-200 text-sm">{post.readTime} de leitura</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          <p className="text-blue-100 text-lg">{post.excerpt}</p>
        </div>
      </section>

      {/* Content */}
      <article className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900">
            <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }} />
          </div>
        </div>
      </article>

      {/* CTA */}
      <section className="bg-gradient-to-r from-green-500 to-emerald-600 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Precisa de Ajuda com seu Caso?
          </h2>
          <p className="text-green-100 mb-6">
            Consulta gratuita com advogado brasileiro especializado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/caso"
              className="inline-flex items-center justify-center gap-2 bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
            >
              📝 Contar meu Caso
            </Link>
            <Link
              href="/advogados"
              className="inline-flex items-center justify-center gap-2 bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
            >
              🔍 Buscar Advogado
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
