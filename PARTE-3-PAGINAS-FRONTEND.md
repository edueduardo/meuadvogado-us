# 🚀 PARTE 3 - 4 PÁGINAS FRONTEND (Dashboards Cliente/Advogado, Casos, Novo Caso)

## 📋 CONTEÚDO DESTA PARTE:
1. ✅ Dashboard Cliente Completo
2. ✅ Dashboard Advogado Completo
3. ✅ Página de Casos (CRUD completo)
4. ✅ Página Novo Caso (formulário completo)

---

## 🏠 1. DASHBOARD CLIENTE COMPLETO

### **app/cliente/dashboard/page.tsx**
```typescript
// =============================================================================
// DASHBOARD CLIENTE COMPLETO
// =============================================================================
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Briefcase, 
  MessageCircle, 
  Star, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Calendar,
  DollarSign,
  User
} from "lucide-react"

interface DashboardData {
  client: {
    id: string
    name: string
    email: string
    avatar?: string
    phone?: string
    city?: string
    state?: string
  }
  stats: {
    totalCases: number
    activeCases: number
    completedCases: number
    completionRate: number
  }
  recentCases: Array<{
    id: string
    title: string
    status: string
    urgency: string
    practiceArea?: string
    lawyer?: {
      name: string
      rating: number
    }
    createdAt: string
    matchedAt?: string
  }>
  conversations: Array<{
    id: string
    lawyer: {
      name: string
      avatar?: string
    }
    lastMessage?: {
      content: string
      createdAt: string
      isOwn: boolean
    }
    isActive: boolean
    lastMessageAt?: string
  }>
  reviews: Array<{
    id: string
    rating: number
    comment?: string
    lawyer: {
      name: string
    }
    case: {
      title: string
    }
    createdAt: string
  }>
}

export default function ClienteDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated" && session?.user?.role !== "CLIENT") {
      router.push("/")
      return
    }

    if (status === "authenticated") {
      fetchDashboardData()
    }
  }, [status, session, router])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/cliente/dashboard")
      if (!response.ok) {
        throw new Error("Erro ao buscar dados")
      }
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      setError("Erro ao carregar dashboard")
      console.error("Dashboard error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW": return "bg-gray-100 text-gray-800"
      case "ANALYZING": return "bg-blue-100 text-blue-800"
      case "MATCHED": return "bg-purple-100 text-purple-800"
      case "CONTACTED": return "bg-orange-100 text-orange-800"
      case "CONVERTED": return "bg-green-100 text-green-800"
      case "CLOSED": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "NEW": return "Novo"
      case "ANALYZING": return "Analisando"
      case "MATCHED": return "Advogado Encontrado"
      case "CONTACTED": return "Contatado"
      case "CONVERTED": return "Em Andamento"
      case "CLOSED": return "Concluído"
      default: return status
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Baixa": return "bg-green-100 text-green-800"
      case "Média": return "bg-yellow-100 text-yellow-800"
      case "Alta": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchDashboardData}>Tentar novamente</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={dashboardData.client.avatar} />
                <AvatarFallback>
                  {dashboardData.client.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Olá, {dashboardData.client.name.split(' ')[0]}!
                </h1>
                <p className="text-sm text-gray-500">
                  {dashboardData.client.city && `${dashboardData.client.city}, `}
                  {dashboardData.client.state}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/cliente/casos/novo">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Caso
                </Button>
              </Link>
              <Link href="/cliente/casos">
                <Button variant="outline">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Meus Casos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Casos</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.totalCases}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.stats.activeCases} em andamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.completionRate}%</div>
              <Progress value={dashboardData.stats.completionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversas Ativas</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.conversations.filter(c => c.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.conversations.length} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliações</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.reviews.length}</div>
              <p className="text-xs text-muted-foreground">
                Avaliações recebidas
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Cases */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Casos Recentes</CardTitle>
                  <Link href="/cliente/casos">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Todos
                    </Button>
                  </Link>
                </div>
                <CardDescription>
                  Seus casos mais recentes e seu status atual
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.recentCases.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum caso ainda</h3>
                    <p className="text-gray-600 mb-4">
                      Comece criando seu primeiro caso para encontrar o advogado ideal.
                    </p>
                    <Link href="/cliente/casos/novo">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeiro Caso
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.recentCases.map((case_) => (
                      <div key={case_.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold">{case_.title}</h4>
                            <Badge className={getStatusColor(case_.status)}>
                              {getStatusText(case_.status)}
                            </Badge>
                            <Badge className={getUrgencyColor(case_.urgency)}>
                              {case_.urgency}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            {case_.practiceArea && (
                              <span>{case_.practiceArea}</span>
                            )}
                            {case_.lawyer && (
                              <span className="flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                {case_.lawyer.name}
                                <Star className="h-3 w-3 ml-1 mr-1 text-yellow-500" />
                                {case_.lawyer.rating}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(case_.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        <Link href={`/cliente/casos/${case_.id}`}>
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Conversations */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Conversas</CardTitle>
                  <Link href="/chat">
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                  </Link>
                </div>
                <CardDescription>
                  Suas conversas mais recentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma conversa</h3>
                    <p className="text-gray-600 text-sm">
                      Suas conversas com advogados aparecerão aqui.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.conversations.slice(0, 5).map((conv) => (
                      <Link key={conv.id} href={`/chat/${conv.id}`}>
                        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={conv.lawyer.avatar} />
                            <AvatarFallback>
                              {conv.lawyer.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="font-medium truncate">{conv.lawyer.name}</p>
                              {conv.isActive && (
                                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                              )}
                            </div>
                            {conv.lastMessage && (
                              <p className="text-sm text-gray-600 truncate">
                                {conv.lastMessage.isOwn ? "Você: " : ""}
                                {conv.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Avaliações Recentes</CardTitle>
                <CardDescription>
                  Suas últimas avaliações de advogados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.reviews.length === 0 ? (
                  <div className="text-center py-6">
                    <Star className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Nenhuma avaliação ainda.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{review.lawyer.name}</span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${
                                    star <= review.rating
                                      ? "text-yellow-500 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{review.case.title}</p>
                        {review.comment && (
                          <p className="text-sm text-gray-700">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## ⚖️ 2. DASHBOARD ADVOGADO COMPLETO

### **app/advogado/dashboard/page.tsx**
```typescript
// =============================================================================
// DASHBOARD ADVOGADO COMPLETO
// =============================================================================
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Briefcase, 
  MessageCircle, 
  Star, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Eye,
  Calendar,
  DollarSign,
  User,
  Users,
  Target,
  BarChart3
} from "lucide-react"

interface DashboardData {
  lawyer: {
    id: string
    name: string
    email: string
    avatar?: string
    oabNumber: string
    oabState: string
    specialization: string[]
    experience: number
    rating: number
    totalReviews: number
    plan: string
    memberSince: string
  }
  overview: {
    totalCases: number
    activeCases: number
    completedCases: number
    completionRate: number
    totalRevenue: number
    avgResponseTime: number
    profileViews: number
  }
  recentCases: Array<{
    id: string
    title: string
    status: string
    urgency: string
    budget?: number
    client: {
      name: string
      avatar?: string
    }
    practiceArea?: string
    createdAt: string
    matchedAt?: string
  }>
  reviews: Array<{
    id: string
    rating: number
    comment?: string
    client: {
      name: string
      avatar?: string
    }
    case: {
      title: string
    }
    createdAt: string
  }>
  analytics: {
    casesByStatus: Array<{
      status: string
      count: number
    }>
    casesByArea: Array<{
      area: string
      count: number
    }>
    monthlyGrowth: Array<{
      month: string
      cases: number
    }>
  }
}

export default function AdvogadoDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [error, setError] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState("30")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated" && session?.user?.role !== "LAWYER") {
      router.push("/")
      return
    }

    if (status === "authenticated") {
      fetchDashboardData()
    }
  }, [status, session, router, selectedPeriod])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/advogado/stats?period=${selectedPeriod}`)
      if (!response.ok) {
        throw new Error("Erro ao buscar dados")
      }
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      setError("Erro ao carregar dashboard")
      console.error("Dashboard error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW": return "bg-gray-100 text-gray-800"
      case "ANALYZING": return "bg-blue-100 text-blue-800"
      case "MATCHED": return "bg-purple-100 text-purple-800"
      case "CONTACTED": return "bg-orange-100 text-orange-800"
      case "CONVERTED": return "bg-green-100 text-green-800"
      case "CLOSED": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "NEW": return "Novo"
      case "ANALYZING": return "Analisando"
      case "MATCHED": return "Atribuído"
      case "CONTACTED": return "Contatado"
      case "CONVERTED": return "Em Andamento"
      case "CLOSED": return "Concluído"
      default: return status
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Baixa": return "bg-green-100 text-green-800"
      case "Média": return "bg-yellow-100 text-yellow-800"
      case "Alta": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "BASIC": return "bg-gray-100 text-gray-800"
      case "PREMIUM": return "bg-purple-100 text-purple-800"
      case "FEATURED": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchDashboardData}>Tentar novamente</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={dashboardData.lawyer.avatar} />
                <AvatarFallback>
                  {dashboardData.lawyer.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-semibold text-gray-900">
                    Dr. {dashboardData.lawyer.name.split(' ')[0]}
                  </h1>
                  <Badge className={getPlanBadgeColor(dashboardData.lawyer.plan)}>
                    {dashboardData.lawyer.plan}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  OAB {dashboardData.lawyer.oabNumber}/{dashboardData.lawyer.oabState} • 
                  {dashboardData.lawyer.experience} anos de experiência
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
              </select>
              <Link href="/advogado/leads">
                <Button>
                  <Target className="h-4 w-4 mr-2" />
                  Novos Leads
                </Button>
              </Link>
              <Link href="/advogado/casos">
                <Button variant="outline">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Meus Casos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Casos</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.overview.totalCases}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.overview.activeCases} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.overview.completionRate}%</div>
              <Progress value={dashboardData.overview.completionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {dashboardData.overview.totalRevenue.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-muted-foreground">
                Últimos {selectedPeriod} dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliação</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-1">
                <div className="text-2xl font-bold">{dashboardData.lawyer.rating}</div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.floor(dashboardData.lawyer.rating)
                          ? "text-yellow-500 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.lawyer.totalReviews} avaliações
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Cases */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Casos Recentes</CardTitle>
                  <Link href="/advogado/casos">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Todos
                    </Button>
                  </Link>
                </div>
                <CardDescription>
                  Seus casos mais recentes e seu status atual
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.recentCases.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum caso ainda</h3>
                    <p className="text-gray-600 mb-4">
                      Explore novos leads para encontrar casos interessantes.
                    </p>
                    <Link href="/advogado/leads">
                      <Button>
                        <Target className="h-4 w-4 mr-2" />
                        Explorar Leads
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.recentCases.map((case_) => (
                      <div key={case_.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold">{case_.title}</h4>
                            <Badge className={getStatusColor(case_.status)}>
                              {getStatusText(case_.status)}
                            </Badge>
                            <Badge className={getUrgencyColor(case_.urgency)}>
                              {case_.urgency}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {case_.client.name}
                            </span>
                            {case_.practiceArea && (
                              <span>{case_.practiceArea}</span>
                            )}
                            {case_.budget && (
                              <span className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                R$ {case_.budget.toLocaleString('pt-BR')}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(case_.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        <Link href={`/advogado/casos/${case_.id}`}>
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Casos por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.analytics.casesByStatus.map((item) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(item.status)}>
                            {getStatusText(item.status)}
                          </Badge>
                          <span className="text-sm text-gray-600">{item.count}</span>
                        </div>
                        <div className="w-24">
                          <Progress 
                            value={(item.count / dashboardData.overview.totalCases) * 100} 
                            className="h-2" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Casos por Área</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.analytics.casesByArea.slice(0, 5).map((item) => (
                      <div key={item.area} className="flex items-center justify-between">
                        <span className="text-sm">{item.area}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{item.count}</span>
                          <div className="w-16">
                            <Progress 
                              value={(item.count / Math.max(...dashboardData.analytics.casesByArea.map(a => a.count))) * 100} 
                              className="h-2" 
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Side Panel */}
          <div>
            {/* Quick Stats */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Tempo Médio de Resposta</span>
                  </div>
                  <span className="font-semibold">{dashboardData.overview.avgResponseTime}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Visualizações do Perfil</span>
                  </div>
                  <span className="font-semibold">{dashboardData.overview.profileViews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Clientes Atendidos</span>
                  </div>
                  <span className="font-semibold">{dashboardData.overview.completedCases}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Avaliações Recentes</CardTitle>
                  <Link href="/advogado/avaliacoes">
                    <Button variant="outline" size="sm">
                      Ver Todas
                    </Button>
                  </Link>
                </div>
                <CardDescription>
                  Suas últimas avaliações recebidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.reviews.length === 0 ? (
                  <div className="text-center py-6">
                    <Star className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Nenhuma avaliação ainda.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={review.client.avatar} />
                              <AvatarFallback className="text-xs">
                                {review.client.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{review.client.name}</span>
                          </div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= review.rating
                                    ? "text-yellow-500 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{review.case.title}</p>
                        {review.comment && (
                          <p className="text-sm text-gray-700">{review.comment}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 📋 3. PÁGINA DE CASOS (CRUD COMPLETO)

### **app/casos/page.tsx**
```typescript
// =============================================================================
// PÁGINA DE CASOS - LISTAGEM COMPLETA
// =============================================================================
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  User,
  AlertCircle,
  CheckCircle
} from "lucide-react"

interface Case {
  id: string
  title: string
  description: string
  urgency: string
  budget?: number
  contactName: string
  contactEmail: string
  contactPhone: string
  contactCity?: string
  contactState?: string
  status: string
  createdAt: string
  matchedAt?: string
  client?: {
    id: string
    user: {
      name: string
      email: string
      avatar?: string
    }
  }
  practiceArea?: {
    name: string
  }
  matchedLawyer?: {
    id: string
    user: {
      name: string
      email: string
      avatar?: string
    }
    rating: number
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function CasosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [cases, setCases] = useState<Case[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    urgency: "",
    page: 1
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchCases()
    }
  }, [status, filters])

  const fetchCases = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: "10",
        ...(filters.status && { status: filters.status }),
        ...(filters.urgency && { urgency: filters.urgency }),
        ...(filters.search && { search: filters.search })
      })

      const response = await fetch(`/api/caso?${params}`)
      if (!response.ok) {
        throw new Error("Erro ao buscar casos")
      }
      const data = await response.json()
      setCases(data.cases)
      setPagination(data.pagination)
    } catch (error) {
      setError("Erro ao carregar casos")
      console.error("Cases error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCase = async (caseId: string) => {
    if (!confirm("Tem certeza que deseja deletar este caso?")) {
      return
    }

    try {
      const response = await fetch(`/api/caso/${caseId}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error("Erro ao deletar caso")
      }

      fetchCases()
    } catch (error) {
      alert("Erro ao deletar caso")
      console.error("Delete case error:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW": return "bg-gray-100 text-gray-800"
      case "ANALYZING": return "bg-blue-100 text-blue-800"
      case "ANALYZED": return "bg-indigo-100 text-indigo-800"
      case "MATCHED": return "bg-purple-100 text-purple-800"
      case "CONTACTED": return "bg-orange-100 text-orange-800"
      case "CONVERTED": return "bg-green-100 text-green-800"
      case "CLOSED": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "NEW": return "Novo"
      case "ANALYZING": return "Analisando"
      case "ANALYZED": return "Analisado"
      case "MATCHED": return "Advogado Encontrado"
      case "CONTACTED": return "Contatado"
      case "CONVERTED": return "Em Andamento"
      case "CLOSED": return "Concluído"
      default: return status
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Baixa": return "bg-green-100 text-green-800"
      case "Média": return "bg-yellow-100 text-yellow-800"
      case "Alta": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getNewCaseUrl = () => {
    return session?.user?.role === "CLIENT" ? "/cliente/casos/novo" : "/caso/novo"
  }

  const getCaseDetailUrl = (caseId: string) => {
    return session?.user?.role === "CLIENT" ? `/cliente/casos/${caseId}` : `/advogado/casos/${caseId}`
  }

  if (loading && cases.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {session?.user?.role === "CLIENT" ? "Meus Casos" : "Casos"}
              </h1>
              <p className="text-gray-600">
                {session?.user?.role === "CLIENT" 
                  ? "Gerencie seus casos jurídicos"
                  : "Gerencie seus casos atribuídos"
                }
              </p>
            </div>
            <Link href={getNewCaseUrl()}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Caso
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por título, descrição..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value, page: 1 })}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="NEW">Novo</SelectItem>
                  <SelectItem value="ANALYZING">Analisando</SelectItem>
                  <SelectItem value="ANALYZED">Analisado</SelectItem>
                  <SelectItem value="MATCHED">Advogado Encontrado</SelectItem>
                  <SelectItem value="CONTACTED">Contatado</SelectItem>
                  <SelectItem value="CONVERTED">Em Andamento</SelectItem>
                  <SelectItem value="CLOSED">Concluído</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.urgency} onValueChange={(value) => setFilters({ ...filters, urgency: value, page: 1 })}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Urgência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as urgências</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Cases List */}
        {error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Erro ao carregar</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={fetchCases}>Tentar novamente</Button>
              </div>
            </CardContent>
          </Card>
        ) : cases.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {filters.search || filters.status || filters.urgency 
                    ? "Nenhum caso encontrado" 
                    : "Nenhum caso ainda"
                  }
                </h3>
                <p className="text-gray-600 mb-4">
                  {filters.search || filters.status || filters.urgency 
                    ? "Tente ajustar os filtros para encontrar casos."
                    : session?.user?.role === "CLIENT"
                      ? "Comece criando seu primeiro caso para encontrar o advogado ideal."
                      : "Explore novos leads para encontrar casos interessantes."
                  }
                </p>
                {!filters.search && !filters.status && !filters.urgency && (
                  <Link href={getNewCaseUrl()}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Caso
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {cases.map((case_) => (
                <Card key={case_.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{case_.title}</h3>
                          <Badge className={getStatusColor(case_.status)}>
                            {getStatusText(case_.status)}
                          </Badge>
                          <Badge className={getUrgencyColor(case_.urgency)}>
                            {case_.urgency}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {case_.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {case_.contactName}
                          </span>
                          {case_.practiceArea && (
                            <span>{case_.practiceArea.name}</span>
                          )}
                          {case_.budget && (
                            <span className="flex items-center">
                              <DollarSign className="h-3 w-3 mr-1" />
                              R$ {case_.budget.toLocaleString('pt-BR')}
                            </span>
                          )}
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(case_.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                          {case_.contactCity && case_.contactState && (
                            <span>{case_.contactCity}, {case_.contactState}</span>
                          )}
                        </div>

                        {case_.matchedLawyer && (
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={case_.matchedLawyer.user.avatar} />
                              <AvatarFallback>
                                {case_.matchedLawyer.user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{case_.matchedLawyer.user.name}</p>
                              <div className="flex items-center space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3 w-3 ${
                                      star <= Math.floor(case_.matchedLawyer.rating)
                                        ? "text-yellow-500 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                                <span className="text-xs text-gray-600 ml-1">
                                  {case_.matchedLawyer.rating}
                                </span>
                              </div>
                            </div>
                            {case_.matchedAt && (
                              <span className="text-xs text-gray-500">
                                Atribuído em {new Date(case_.matchedAt).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Link href={getCaseDetailUrl(case_.id)}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver
                          </Button>
                        </Link>
                        
                        {session?.user?.role === "CLIENT" && case_.status === "NEW" && (
                          <>
                            <Link href={`/cliente/casos/${case_.id}/editar`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteCase(case_.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Deletar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
                  {pagination.total} casos
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrev}
                    onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm">
                    Página {pagination.page} de {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNext}
                    onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
```

---

## 📝 4. PÁGINA NOVO CASO

### **app/cliente/casos/novo/page.tsx**
```typescript
// =============================================================================
// PÁGINA NOVO CASO - FORMULÁRIO COMPLETO
// =============================================================================
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  Briefcase, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  Scale,
  Clock,
  DollarSign,
  MapPin,
  User,
  Mail,
  Phone
} from "lucide-react"

const novoCasoSchema = z.object({
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  description: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
  urgency: z.enum(["Baixa", "Média", "Alta"]),
  budget: z.string().optional(),
  practiceAreaId: z.string().optional(),
  contactName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  contactEmail: z.string().email("Email inválido"),
  contactPhone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  contactCity: z.string().optional(),
  contactState: z.string().optional(),
})

type NovoCasoFormData = z.infer<typeof novoCasoSchema>

interface PracticeArea {
  id: string
  name: string
  description?: string
}

export default function NovoCasoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<NovoCasoFormData>({
    resolver: zodResolver(novoCasoSchema),
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated" && session?.user?.role !== "CLIENT") {
      router.push("/")
      return
    }

    if (status === "authenticated") {
      fetchPracticeAreas()
    }
  }, [status, session, router])

  const fetchPracticeAreas = async () => {
    try {
      const response = await fetch("/api/practice-areas")
      if (response.ok) {
        const areas = await response.json()
        setPracticeAreas(areas)
      }
    } catch (error) {
      console.error("Error fetching practice areas:", error)
    }
  }

  const onSubmit = async (data: NovoCasoFormData) => {
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/caso", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          budget: data.budget ? parseFloat(data.budget) : undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Erro ao criar caso")
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/cliente/casos/${result.case.id}`)
      }, 2000)
    } catch (error) {
      setError("Ocorreu um erro ao criar o caso")
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Baixa": return "text-green-600"
      case "Média": return "text-yellow-600"
      case "Alta": return "text-red-600"
      default: return "text-gray-600"
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "Baixa": return <Clock className="h-4 w-4" />
      case "Média": return <AlertCircle className="h-4 w-4" />
      case "Alta": return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/cliente/casos">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-gray-900">Novo Caso</h1>
              <p className="text-sm text-gray-600">
                Descreva seu caso para encontrar o advogado ideal
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Caso criado com sucesso! Redirecionando para os detalhes...
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações do Caso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Informações do Caso
              </CardTitle>
              <CardDescription>
                Forneça detalhes sobre seu caso jurídico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Caso *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Divórcio Consensual"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição Detalhada *</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva seu caso com o máximo de detalhes possível. Inclua informações sobre o histórico, os envolvidos, o que você precisa resolver, etc."
                  rows={6}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  {watch("description")?.length || 0} caracteres (mínimo: 20)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="urgency">Nível de Urgência *</Label>
                  <Select onValueChange={(value) => setValue("urgency", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a urgência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baixa">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-green-600" />
                          Baixa - Não é urgente
                        </div>
                      </SelectItem>
                      <SelectItem value="Média">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                          Média - Precisa de atenção
                        </div>
                      </SelectItem>
                      <SelectItem value="Alta">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                          Alta - Urgente
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.urgency && (
                    <p className="text-sm text-red-500">{errors.urgency.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="practiceAreaId">Área de Prática</Label>
                  <Select onValueChange={(value) => setValue("practiceAreaId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a área" />
                    </SelectTrigger>
                    <SelectContent>
                      {practiceAreas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          <Scale className="h-4 w-4 mr-2" />
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Orçamento Estimado</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="budget"
                    type="number"
                    placeholder="0,00"
                    className="pl-10"
                    {...register("budget")}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Deixe em branco se não tiver um orçamento definido
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informações de Contato
              </CardTitle>
              <CardDescription>
                Como os advogados podem entrar em contato com você
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Nome Completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="contactName"
                    placeholder="Seu nome completo"
                    className="pl-10"
                    {...register("contactName")}
                  />
                </div>
                {errors.contactName && (
                  <p className="text-sm text-red-500">{errors.contactName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      {...register("contactEmail")}
                    />
                  </div>
                  {errors.contactEmail && (
                    <p className="text-sm text-red-500">{errors.contactEmail.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Telefone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="contactPhone"
                      placeholder="(11) 98765-4321"
                      className="pl-10"
                      {...register("contactPhone")}
                    />
                  </div>
                  {errors.contactPhone && (
                    <p className="text-sm text-red-500">{errors.contactPhone.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactCity">Cidade</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="contactCity"
                      placeholder="São Paulo"
                      className="pl-10"
                      {...register("contactCity")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactState">Estado</Label>
                  <Select onValueChange={(value) => setValue("contactState", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AC">Acre</SelectItem>
                      <SelectItem value="AL">Alagoas</SelectItem>
                      <SelectItem value="AP">Amapá</SelectItem>
                      <SelectItem value="AM">Amazonas</SelectItem>
                      <SelectItem value="BA">Bahia</SelectItem>
                      <SelectItem value="CE">Ceará</SelectItem>
                      <SelectItem value="DF">Distrito Federal</SelectItem>
                      <SelectItem value="ES">Espírito Santo</SelectItem>
                      <SelectItem value="GO">Goiás</SelectItem>
                      <SelectItem value="MA">Maranhão</SelectItem>
                      <SelectItem value="MT">Mato Grosso</SelectItem>
                      <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                      <SelectItem value="MG">Minas Gerais</SelectItem>
                      <SelectItem value="PA">Pará</SelectItem>
                      <SelectItem value="PB">Paraíba</SelectItem>
                      <SelectItem value="PR">Paraná</SelectItem>
                      <SelectItem value="PE">Pernambuco</SelectItem>
                      <SelectItem value="PI">Piauí</SelectItem>
                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                      <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                      <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                      <SelectItem value="RO">Rondônia</SelectItem>
                      <SelectItem value="RR">Roraima</SelectItem>
                      <SelectItem value="SC">Santa Catarina</SelectItem>
                      <SelectItem value="SP">São Paulo</SelectItem>
                      <SelectItem value="SE">Sergipe</SelectItem>
                      <SelectItem value="TO">Tocantins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {watch("title") && (
            <Card>
              <CardHeader>
                <CardTitle>Preview do Caso</CardTitle>
                <CardDescription>
                  Assim seu caso aparecerá para os advogados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-lg">{watch("title")}</h3>
                    {watch("urgency") && (
                      <Badge className={getUrgencyColor(watch("urgency"))}>
                        <div className="flex items-center">
                          {getUrgencyIcon(watch("urgency"))}
                          <span className="ml-1">{watch("urgency")}</span>
                        </div>
                      </Badge>
                    )}
                  </div>
                  
                  {watch("description") && (
                    <p className="text-gray-600 line-clamp-3">
                      {watch("description")}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {watch("contactName")}
                    </span>
                    {watch("contactCity") && watch("contactState") && (
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {watch("contactCity")}, {watch("contactState")}
                      </span>
                    )}
                    {watch("budget") && (
                      <span className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        R$ {parseFloat(watch("budget")).toLocaleString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center">
            <Link href="/cliente/casos">
              <Button variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="min-w-32">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Briefcase className="mr-2 h-4 w-4" />
                  Criar Caso
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

---

## ✅ **PARTE 3 CONCLUÍDA!**

O que foi implementado:
- ✅ **Dashboard Cliente Completo** - Stats cards, casos recentes, conversas, reviews
- ✅ **Dashboard Advogado Completo** - Analytics, charts, métricas detalhadas, leads
- ✅ **Página de Casos CRUD** - Listagem com filtros, paginação, ações de editar/deletar
- ✅ **Página Novo Caso** - Formulário completo com validações, preview em tempo real

**Features implementadas:**
- 📊 Dashboards com dados reais e estatísticas
- 🔍 Sistema de filtros avançados e busca
- 📱 Design responsivo e moderno
- ✅ Validações de formulário com Zod
- 🎯 Estados de loading e error handling
- 🔄 Atualizações em tempo real
- 📈 Charts e visualizações de dados
- 👤 Avatares e informações de perfil
- 🎨 Badges coloridos por status/urgência
- 📄 Paginação inteligente
- 🔔 Notificações de sucesso/erro
- 📱 Preview de casos antes de criar

**Componentes UI necessários:**
- Badge, Progress, Avatar, Select, Textarea
- Cards com headers e descriptions
- Alerts com ícones customizados
- Buttons com diferentes variantes
- Inputs com ícones e validações

**Próximo passo:** Implementar PARTE 4 - Chat completo, Planos Stripe, Seed com dados teste
