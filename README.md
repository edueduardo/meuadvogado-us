# 🇺🇸 Meu Advogado - Diretório de Advogados Brasileiros nos EUA

Plataforma SaaS que conecta brasileiros nos Estados Unidos com advogados que falam português e entendem suas necessidades jurídicas.

## 🚀 Visão Geral

**Meu Advogado** é um diretório online focado em conectar a comunidade brasileira nos EUA com advogados qualificados que oferecem serviços em português. A plataforma utiliza IA para analisar casos e recomendar os melhores profissionais para cada situação.

### 🎯 Público-Alvo
- **Clientes**: Brasileiros buscando assistência jurídica nos EUA
- **Advogados**: Profissionais que atendem clientes brasileiros

### 💡 Principais Features
- 📋 **"Conte seu Caso"**: IA analisa a situação e recomenda advogados
- 🔍 **Busca Avançada**: Filtrar por localização, área de atuação, especialidade
- ⭐ **Sistema de Avaliações**: Feedback verificado dos clientes
- 💳 **Planos Assinatura**: Gratuito, Premium (R$199/mês), Destaque (R$399/mês)
- 📱 **Contato Direto**: WhatsApp, e-mail, telefone
- 🌐 **Multi-idioma**: Português, Inglês, Espanhol

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco**: PostgreSQL (via Supabase)
- **Autenticação**: NextAuth.js
- **Pagamentos**: Stripe
- **IA**: Anthropic Claude
- **Email**: Resend
- **Deploy**: Vercel

## 📁 Estrutura do Projeto

```
meuadvogado-us/
├── app/                    # Páginas e APIs
│   ├── api/               # API Routes
│   │   ├── caso/          # "Conte seu Caso"
│   │   └── advogados/     # CRUD Advogados
│   ├── caso/              # Formulário de caso
│   ├── advogados/         # Listagem de advogados
│   ├── para-advogados/    # Venda para advogados
│   ├── login/             # Login
│   ├── cadastro/          # Cadastro
│   └── page.tsx           # Landing page
├── lib/                   # Bibliotecas core
│   ├── prisma.ts         # Conexão DB
│   ├── ai.ts             # Análise com IA
│   ├── plans.ts          # Planos e limites
│   ├── stripe.ts         # Config Stripe
│   ├── i18n.ts           # Traduções
│   └── utils.ts          # Utilitários
├── prisma/
│   ├── schema.prisma     # Modelo de dados
│   └── seed.ts           # Dados iniciais
└── public/               # Assets estáticos
```

## 🚀 Getting Started

### 1. Clonar o Repositório
```bash
git clone <repository-url>
cd meuadvogado-us
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
```bash
cp .env.example .env.local
```

Preencha as variáveis:
```env
# Database
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
SUPABASE_URL="https://[project].supabase.co"
SUPABASE_ANON_KEY="[anon_key]"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[secret]"

# Stripe
STRIPE_SECRET_KEY="[sk_test_...]"
STRIPE_PUBLISHABLE_KEY="[pk_test_...]"
STRIPE_PRICE_PREMIUM="[price_id]"
STRIPE_PRICE_FEATURED="[price_id]"

# AI
ANTHROPIC_API_KEY="[sk-ant-...]"

# Email
RESEND_API_KEY="[re_...]"
```

### 4. Configurar Banco de Dados
```bash
# Gerar Prisma Client
npx prisma generate

# Fazer migrate do schema
npx prisma db push

# Rodar seed (dados iniciais)
npx prisma db seed
```

### 5. Rodar o Servidor
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📊 Modelo de Dados

### Principais Entidades
- **User**: Usuários (advogados)
- **LawyerProfile**: Perfil detalhado do advogado
- **PracticeArea**: Áreas de atuação
- **Review**: Avaliações de clientes
- **Lead**: Contatos/leads gerados
- **Case**: Casos submetidos para análise
- **City**: Cidades com população brasileira
- **Subscription**: Assinaturas Stripe

### Planos
- **FREE**: Perfil básico, 1 área de atuação
- **PREMIUM** (R$199/mês): 5 áreas, badge, 10 leads/mês
- **FEATURED** (R$399/mês): Ilimitado, topo da busca, leads ilimitados

## 🔄 Fluxos Principais

### Cliente
1. Acessa landing page
2. Busca advogados ou usa "Conte seu Caso"
3. IA analisa o caso e recomenda advogados
4. Entra em contato direto com os advogados

### Advogado
1. Faz cadastro gratuito
2. Completa perfil com áreas de atuação
3. Recebe leads de clientes
4. Pode fazer upgrade para planos pagos

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

O deploy é automático via push para o GitHub.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie branch para sua feature (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para o branch (`git push origin feature/amazing-feature`)
5. Abra Pull Request

## 📄 Licença

Este projeto é privado e confidencial.

## 🆘 Suporte

Para dúvidas ou suporte, entre em contato:
- E-mail: contato@meuadvogado.us
- WhatsApp: (XX) XXXXX-XXXX

---

**Meu Advogado** - Conectando brasileiros com justiça nos EUA 🇺🇸🇧🇷
