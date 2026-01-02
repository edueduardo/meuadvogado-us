# 🇺🇸 Meu Advogado

Diretório de advogados brasileiros nos Estados Unidos.

## 🚀 Deploy Rápido

### Opção 1: Vercel (Recomendado)

1. Faça upload deste repositório para o GitHub
2. Vá em [vercel.com](https://vercel.com)
3. Clique em "New Project"
4. Importe o repositório
5. Clique em "Deploy"

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

## 🔮 Próximos Passos

Para adicionar funcionalidades reais:

1. **Banco de Dados**: Adicionar Prisma + PostgreSQL
2. **Autenticação**: NextAuth.js
3. **Pagamentos**: Stripe
4. **IA**: Anthropic Claude para análise de casos

## 📄 Licença

Privado - Todos os direitos reservados.
