import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://meuadvogado-us.vercel.app'
  
  const staticPages = [
    '',
    '/advogados',
    '/caso',
    '/para-advogados',
    '/login',
    '/cadastro',
    '/como-funciona',
    '/planos',
    '/privacidade',
    '/termos',
  ]

  const practiceAreas = [
    'imigracao',
    'familia',
    'criminal',
    'acidentes',
    'trabalhista',
    'empresarial',
    'imobiliario',
  ]

  const states = ['FL', 'MA', 'NJ', 'NY', 'CA', 'TX']

  return [
    ...staticPages.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1 : 0.8,
    })),
    ...practiceAreas.map((area) => ({
      url: `${baseUrl}/advogados?area=${area}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    })),
    ...states.map((state) => ({
      url: `${baseUrl}/advogados?state=${state}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    })),
  ]
}
