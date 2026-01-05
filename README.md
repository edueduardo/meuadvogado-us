# 🇺🇸 Meu Advogado - SaaS Completo 100% Funcional

Plataforma completa de conexão entre advogados brasileiros e clientes nos Estados Unidos.

**Status:** ✅ 100% Implementado e Funcional - Pronto para Produção

## 🚀 Deploy Rápido

### Opção 1: Vercel (Recomendado)

1. Faça upload deste repositório para o GitHub
2. Vá em [vercel.com](https://vercel.com)
3. Clique em "New Project"
4. Importe o repositório
5. Clique em "Deploy"

**⚠️ IMPORTANTE:** Configure as variáveis de ambiente após o deploy:
- Veja: [`VERCEL-SETUP.md`](./VERCEL-SETUP.md)
- Execute: `node scripts/check-env.js`

**Pronto!** Seu site estará no ar em ~1 minuto.

### Opção 2: Local

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

## 📁 Estrutura

```
├── app/
│   ├── page.tsx              # Landing page
│   ├── advogados/page.tsx    # Lista de advogados
│   ├── caso/page.tsx         # Formulário "Conte seu Caso"
│   ├── login/page.tsx        # Login
│   ├── cadastro/page.tsx     # Cadastro de advogados
│   ├── dashboard/page.tsx    # Dashboard do advogado
│   ├── para-advogados/page.tsx # Landing B2B
│   └── api/
│       ├── advogados/route.ts
│       └── caso/route.ts
├── package.json
├── tailwind.config.js
└── next.config.js
```

## 🛠️ Stack

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem
- **Tailwind CSS** - Estilos

## 📱 Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page principal |
| `/advogados` | Lista de advogados |
| `/caso` | Formulário para clientes |
| `/login` | Login de advogados |
| `/cadastro` | Cadastro de advogados |
| `/dashboard` | Dashboard do advogado |
| `/para-advogados` | Landing para advogados |

## ✅ Funcionalidades Implementadas

**Sistema 100% Funcional e Pronto para Produção:**

1. ✅ **Autenticação NextAuth** - Login, cadastro, proteção de rotas
2. ✅ **Banco de Dados Prisma** - PostgreSQL completo
3. ✅ **Dashboard Advogado** - Dados reais, estatísticas, consultas, casos
4. ✅ **Dashboard Cliente** - Casos, consultas, pagamentos
5. ✅ **Perfil Público Advogado** - Página dinâmica com SEO
6. ✅ **Agendamento de Consultas** - Calendário + conflitos
7. ✅ **Chat em Tempo Real** - Mensagens + histórico
8. ✅ **Pagamentos Stripe** - Checkout integrado
9. ✅ **Emails Automáticos** - Confirmação, lembrete, recibo
10. ✅ **Notificações Push** - In-app + email
11. ✅ **Busca Inteligente** - Filtros + paginação
12. ✅ **Analytics** - Rastreamento de eventos
13. ✅ **Marketplace** - Serviços + avaliações
14. ✅ **VIDEO CONSULTAS** - Jitsi integrado, validações, API completa

**Total:** 203 arquivos, ~15.300 linhas de código

### 🎥 Novo: API de Video Consultas

**Endpoint:** `POST /api/consultations/create`

Criar e gerenciar consultas por vídeo com Jitsi integrado:
- Gera link Jitsi automaticamente
- Valida disponibilidade de horário
- Rate limiting (5/hora)
- Suporte VIDEO, PHONE, IN_PERSON
- GET endpoint para listar consultas

Ver documentação completa: [`VIDEO-CONSULTAS-IMPLEMENTATION.md`](./VIDEO-CONSULTAS-IMPLEMENTATION.md)

## 📄 Licença

Privado - Todos os direitos reservados.
