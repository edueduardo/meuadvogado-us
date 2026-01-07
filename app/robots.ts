import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/cliente/', '/advogado/', '/admin/'],
    },
    sitemap: 'https://meuadvogado-us.vercel.app/sitemap.xml',
  }
}
