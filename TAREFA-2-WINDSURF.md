# 📋 TAREFA #2: Email Verification UI (WINDSURF)

## ⚠️ IMPORTANTE
Claude implementou o backend completo de verificação de email. Seu trabalho é criar a UI para este backend.

**Backend Status**: ✅ PRONTO
- Endpoint POST `/api/auth/register` - Gera e envia token de verificação
- Endpoint GET `/api/auth/verify?token=XXX` - Valida token e marca email como verificado
- Validação no login - Rejeita se email não foi verificado

**Seu Trabalho**: Criar 3 páginas + 1 endpoint para completar o fluxo

---

## 1️⃣ PÁGINA: Verificação de Email

**Caminho**: `app/(auth)/verify-email/page.tsx`

**Deve fazer**:
```typescript
'use client'

export default function VerifyEmailPage({
  searchParams
}: {
  searchParams: { token?: string }
}) {
  const token = searchParams.token
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError('Token não fornecido')
      return
    }

    // Chamar GET /api/auth/verify?token={token}
    fetch(`/api/auth/verify?token=${token}`)
      .then(res => {
        if (res.ok) {
          setStatus('success')
        } else {
          return res.json().then(data => {
            throw new Error(data.error)
          })
        }
      })
      .catch(err => {
        setStatus('error')
        setError(err.message)
      })
  }, [token])

  if (status === 'verifying') {
    return <div>⏳ Verificando seu email...</div>
  }

  if (status === 'success') {
    return (
      <div>
        ✅ Email verificado com sucesso!
        <Link href="/login">Ir para Login</Link>
      </div>
    )
  }

  return (
    <div>
      ❌ {error}
      <Link href="/cadastro">Reenviar Email</Link>
    </div>
  )
}
```

**Estados de UI que precisa ter**:
- ⏳ Carregando (spinner): "Verificando seu email..."
- ✅ Sucesso: "Email verificado com sucesso!" + botão para login
- ❌ Erro: Mostrar mensagem do backend + link para resend

---

## 2️⃣ MODIFICAR: Tela de Registro (Sucesso)

**Caminho**: `app/(auth)/cadastro/page.tsx`

**Modificar a resposta de sucesso para**:
```typescript
// Após fetch POST /api/auth/register retornar sucesso
if (response.requiresEmailVerification) {
  return (
    <div className="email-verification-pending">
      <h2>✉️ Confirme seu email</h2>
      <p>Enviamos um link de verificação para:</p>
      <p><strong>{userEmail}</strong></p>
      <p>Clique no link no seu email para ativar sua conta.</p>
      <p className="text-sm text-gray-500">
        Não recebeu? Verifique a pasta de spam ou
        <Link href="/resend-verification">solicite um novo link</Link>
      </p>
    </div>
  )
}
```

---

## 3️⃣ ENDPOINT: Reenviar Email de Verificação

**Caminho**: `app/api/auth/resend-verification/route.ts` (CRIAR)

**Responsabilidade**: Gerar novo token se o anterior expirou ou muitas tentativas

```typescript
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateSecureToken, getTokenExpirationDate } from "@/lib/auth-helpers"
import { sendEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Este email já foi verificado" },
        { status: 400 }
      )
    }

    // Buscar último token
    const lastToken = await prisma.emailVerificationToken.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    // Se token recente e válido, rejeitar para evitar spam
    if (lastToken && lastToken.expiresAt > new Date()) {
      return NextResponse.json(
        { error: "Um email foi enviado recentemente. Tente novamente em 5 minutos." },
        { status: 429 }
      )
    }

    // Gerar novo token
    const verificationToken = generateSecureToken()
    const tokenExpiresAt = getTokenExpirationDate(24)

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: tokenExpiresAt,
      }
    })

    // Enviar email
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`

    await sendEmail({
      to: user.email,
      subject: "✅ Novo link de verificação - MeuAdvogado",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Confirme seu email</h2>
          <p>Clique no botão abaixo para verificar seu email:</p>
          <a href="${verificationUrl}" style="background-color: #1a73e8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verificar Email
          </a>
          <p style="color: #999; font-size: 12px;">Link válido por 24 horas.</p>
        </div>
      `
    })

    return NextResponse.json(
      { success: true, message: "Email de verificação reenviado com sucesso!" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: "Erro ao reenviar email" },
      { status: 500 }
    )
  }
}
```

---

## 4️⃣ PÁGINA: Resend Email Form (Opcional mas Recomendado)

**Caminho**: `app/(auth)/resend-verification/page.tsx`

**Deve ter**:
- Input para email
- Botão "Reenviar Email de Verificação"
- Chama `POST /api/auth/resend-verification`
- Mostra sucesso/erro da operação

---

## ✅ CHECKLIST DO WINDSURF

- [ ] Criar `/app/(auth)/verify-email/page.tsx` com validação de token
- [ ] Modificar sucesso de `/cadastro` para mostrar "Email enviado"
- [ ] Criar `/app/api/auth/resend-verification/route.ts` para reenviar emails
- [ ] (Opcional) Criar `/app/(auth)/resend-verification/page.tsx` para formulário
- [ ] Testar fluxo completo: Register → Email → Verify → Login
- [ ] Verificar que login rejeita se email não foi verificado

---

## 🎯 PRÓXIMO PASSO (Claude vai fazer)

Após Windsurf terminar a UI:

**TAREFA #3**: Real-time Chat com WebSocket
- Implementar Socket.IO para mensagens real-time
- Typing indicators
- Delivery confirmation
- Presence tracking (online/offline)

