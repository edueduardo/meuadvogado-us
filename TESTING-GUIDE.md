# 🧪 TESTING GUIDE - GUIA COMPLETO DE TESTES

**Status:** ✅ Implementado - Cobertura parcial  
**Ferramentas:** Jest + React Testing Library + Playwright  
**Cobertura atual:** Componentes (94%), Utils (91%), API (0%)  

---

## 📋 **TIPOS DE TESTES IMPLEMENTADOS**

### **1. Unit Tests (Jest + RTL)**
- ✅ Componentes React
- ✅ Utilidades e helpers
- ✅ Funções puras
- 📂 Localização: `__tests__/`

### **2. Integration Tests (Jest)**
- ✅ API endpoints
- ✅ Fluxos completos
- ✅ Mock de dependências
- 📂 Localização: `__tests__/api/`

### **3. E2E Tests (Playwright)**
- ✅ Fluxos completos do usuário
- ✅ Testes cross-browser
- ✅ Testes responsivos
- 📂 Localização: `e2e/`

---

## 🚀 **COMANDOS DE TESTES**

### **Rodar Todos os Testes**
```bash
npm test                    # Unit + Integration
npm run test:e2e           # E2E Tests
npm run test:coverage      # Com cobertura
```

### **Testes Específicos**
```bash
npm run test:components    # Componentes React
npm run test:api          # API endpoints
npm run test:watch        # Modo watch
```

### **E2E Tests**
```bash
npm run test:e2e          # Todos os E2E
npm run test:e2e:ui       # Interface visual
npm run test:e2e:debug    # Debug mode
```

---

## 📊 **COBERTURA DE TESTES**

### **✅ Alta Cobertura (>90%)**
- `components/Calendar.tsx` - 94%
- `lib/consultations.ts` - 91%

### **⚠️ Cobertura Média (50-90%)**
- Componentes UI básicos
- Utils auxiliares

### **❌ Sem Cobertura (0%)**
- API endpoints (precisam de mock)
- Páginas principais
- Middleware

---

## 🧪 **ESTRUTURA DOS TESTES**

### **Component Tests**
```typescript
// __tests__/components/Calendar.test.tsx
describe('Calendar Component', () => {
  it('renders calendar with current month', () => {
    // Test renderização
  })
  
  it('handles date selection', () => {
    // Test interação
  })
})
```

### **API Tests**
```typescript
// __tests__/api/consultations/create.test.ts
describe('/api/consultations/create', () => {
  it('should create consultation successfully', async () => {
    // Test API endpoint
  })
})
```

### **E2E Tests**
```typescript
// e2e/consultations.spec.ts
test.describe('Video Consultations E2E', () => {
  test('should complete consultation flow', async ({ page }) => {
    // Test fluxo completo
  })
})
```

---

## 🔧 **CONFIGURAÇÃO**

### **Jest Config**
- 📄 `jest.config.js` - Configuração principal
- 📄 `jest.setup.js` - Setup global e mocks
- 🎯 Cobertura mínima: 70% global
- 🎯 Cobertura crítica: 90% (API consultations)

### **Playwright Config**
- 📄 `playwright.config.ts` - Configuração E2E
- 🌐 Chrome, Firefox, Safari
- 📱 Mobile (Pixel 5, iPhone 12)
- 🎥 Vídeo em falhas

---

## 📝 **BOAS PRÁTICAS**

### **1. Test Structure (AAA)**
```typescript
it('should do something', () => {
  // Arrange - Preparar
  const mockData = { ... }
  
  // Act - Executar
  const result = functionUnderTest(mockData)
  
  // Assert - Verificar
  expect(result).toBe(expected)
})
```

### **2. Mock Strategy**
```typescript
// Mock dependências externas
jest.mock('next-auth/react')
jest.mock('@prisma/client')

// Mock APIs
global.fetch = jest.fn()
global.mockApiCall(data, { status: 200 })
```

### **3. Test Data**
```typescript
// Dados consistentes
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  role: 'CLIENT'
}

// Dados variados
const mockConsultations = [
  { status: 'scheduled', ... },
  { status: 'completed', ... }
]
```

---

## 🎯 **COBERTURA POR FEATURE**

### **VIDEO CONSULTAS**
- ✅ API: 0% (precisa implementar)
- ✅ Componentes: 94%
- ✅ Utils: 91%
- ✅ E2E: 100%

### **AUTENTICAÇÃO**
- ❌ API: 0%
- ❌ Componentes: 0%
- ❌ E2E: 0%

### **DASHBOARDS**
- ❌ API: 0%
- ❌ Componentes: 0%
- ❌ E2E: 0%

---

## 🚨 **PROBLEMAS CONHECIDOS**

### **1. API Tests Falhando**
- **Causa:** Mock do Prisma não funciona
- **Solução:** Implementar mock manual ou usar DB de teste

### **2. Cobertura Baixa**
- **Causa:** Muitos arquivos sem testes
- **Solução:** Implementar testes incrementalmente

### **3. E2E Lento**
- **Causa:** Server startup demorado
- **Solução:** Usar Docker ou servidor mock

---

## 📈 **MÉTRICAS ATUAIS**

```
============================== Coverage Summary ==============================
File                       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
==============================+=========+==========+=========+================+=================
All files                   |    3.23 |     2.13 |    4.42 |    3.16 |                     
 components/Calendar.tsx    |   93.61 |    86.66 |   84.61 |   95.34 | 55,59                   
 lib/consultations.ts       |   91.26 |    71.42 |   91.66 |   90.81 | 215,247,255,296,304-314 
==============================+=========+==========+=========+================+=================
```

---

## 🎯 **PRÓXIMOS PASSOS**

### **Curto Prazo (Esta semana)**
1. **Corrigir API tests** - Implementar mock Prisma
2. **Aumentar cobertura** - Adicionar tests críticos
3. **Testes de dashboard** - Cobrir features principais

### **Médio Prazo (Próxima semana)**
1. **Testes de autenticação** - Login, register, session
2. **Testes de pagamento** - Stripe integration
3. **Testes de email** - Resend service

### **Longo Prazo (Mês)**
1. **Performance tests** - Load testing
2. **Security tests** - Penetration testing
3. **Accessibility tests** - A11y compliance

---

## 🛠️ **DEBUG DE TESTES**

### **Jest Debug**
```bash
# Modo debug
node --inspect-brk node_modules/.bin/jest --runInBand

# Test específico
npm test -- --testNamePattern="should create consultation"
```

### **Playwright Debug**
```bash
# Interface visual
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Passo a passo
npx playwright test --debug
```

---

## 📚 **RECURSOS**

### **Documentação**
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [RTL Docs](https://testing-library.com/docs/react-testing-library/intro)
- [Playwright Docs](https://playwright.dev/)

### **Boas Práticas**
- [Testing Best Practices](https://kentcdodds.com/blog/common-testing-mistakes)
- [React Testing Patterns](https://kentcdodds.com/blog/testing-patterns)

---

## ✅ **CHECKLIST DE QUALIDADE**

- [ ] Todos os componentes críticos testados
- [ ] API endpoints principais testados
- [ ] Fluxos E2E funcionando
- [ ] Cobertura > 80% em features críticas
- [ ] Testes rápidos (< 5s unit, < 30s integration)
- [ ] Testes estáveis (sem flaky)
- [ ] Documentação atualizada

---

**Status:** 🟡 **Parcialmente Implementado**  
**Próximo objetivo:** 🎯 **80% cobertura em features críticas**
