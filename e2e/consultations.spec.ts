// e2e/consultations.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Video Consultations E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/cliente/dashboard')
  })

  test('should navigate to consultations page', async ({ page }) => {
    // Click on Agendar Consulta in navigation
    await page.click('text=📹 Agendar Consulta')
    await page.waitForURL('/consultas')
    
    // Check page title
    await expect(page.locator('h1')).toContainText('Consultas Jurídicas')
    
    // Check if lawyers are displayed
    await expect(page.locator('text=Advogados Disponíveis')).toBeVisible()
  })

  test('should display consultation form for lawyer', async ({ page }) => {
    await page.goto('/consultas')
    
    // Click on first lawyer's "Agendar Consulta" button
    await page.click('text=Agendar Consulta', { first: true })
    
    // Wait for form page
    await page.waitForURL('/consultas/agendar/*')
    
    // Check if lawyer info is displayed
    await expect(page.locator('h2')).toBeVisible()
    
    // Check if form elements are present
    await expect(page.locator('label:has-text("Data da Consulta")')).toBeVisible()
    await expect(page.locator('label:has-text("Tipo de Consulta")')).toBeVisible()
    await expect(page.locator('label:has-text("Duração")')).toBeVisible()
  })

  test('should select date and time for consultation', async ({ page }) => {
    await page.goto('/consultas')
    await page.click('text=Agendar Consulta', { first: true })
    
    // Select a future date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateString = tomorrow.toISOString().split('T')[0]
    
    await page.fill('input[type="date"]', dateString)
    
    // Wait for time slots to load
    await page.waitForSelector('button:has-text("09:00")')
    
    // Select an available time slot
    await page.click('button:has-text("09:00"):not(:disabled)')
    
    // Verify time is selected
    const selectedTime = await page.locator('select[name="time"]').inputValue()
    expect(selectedTime).toBe('09:00')
  })

  test('should calculate consultation price correctly', async ({ page }) => {
    await page.goto('/consultas')
    await page.click('text=Agendar Consulta', { first: true })
    
    // Select 1 hour duration
    await page.selectOption('select[name="duration"]', '60')
    
    // Check if price is calculated
    await expect(page.locator('text=Valor estimado:')).toBeVisible()
    await expect(page.locator('text=$')).toBeVisible()
  })

  test('should submit consultation form successfully', async ({ page }) => {
    await page.goto('/consultas')
    await page.click('text=Agendar Consulta', { first: true })
    
    // Fill out the form
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateString = tomorrow.toISOString().split('T')[0]
    
    await page.fill('input[type="date"]', dateString)
    await page.waitForSelector('button:has-text("09:00")')
    await page.click('button:has-text("09:00"):not(:disabled)')
    
    // Select consultation type
    await page.click('input[value="VIDEO"]')
    
    // Add notes
    await page.fill('textarea[name="notes"]', 'Test consultation notes')
    
    // Submit form
    await page.click('text=Confirmar Agendamento')
    
    // Wait for success page
    await page.waitForURL('**/consultas/agendar/**')
    await expect(page.locator('text=Consulta Agendada!')).toBeVisible()
    
    // Check if Jitsi link is displayed
    await expect(page.locator('text=Link da consulta:')).toBeVisible()
    await expect(page.locator('a[href*="meet.jit.si"]')).toBeVisible()
  })

  test('should validate form fields', async ({ page }) => {
    await page.goto('/consultas')
    await page.click('text=Agendar Consulta', { first: true })
    
    // Try to submit without filling form
    await page.click('text=Confirmar Agendamento')
    
    // Should show validation errors
    await expect(page.locator('text=Selecione uma data')).toBeVisible()
  })

  test('should prevent past date selection', async ({ page }) => {
    await page.goto('/consultas')
    await page.click('text=Agendar Consulta', { first: true })
    
    // Try to select yesterday's date
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const dateString = yesterday.toISOString().split('T')[0]
    
    const dateInput = page.locator('input[type="date"]')
    await dateInput.fill(dateString)
    
    // Should show validation error
    await expect(page.locator('text=Data e hora devem ser futuras')).toBeVisible()
  })

  test('should filter lawyers by search', async ({ page }) => {
    await page.goto('/consultas')
    
    // Search for a specific lawyer
    await page.fill('input[placeholder="Buscar advogado..."]', 'John')
    
    // Should filter results
    await expect(page.locator('text=John')).toBeVisible()
  })

  test('should display upcoming consultations', async ({ page }) => {
    await page.goto('/consultas')
    
    // Check if upcoming consultations section exists
    await expect(page.locator('text=Próximas Consultas')).toBeVisible()
    
    // If there are consultations, they should be displayed
    const consultationCards = page.locator('[data-testid="consultation-card"]')
    if (await consultationCards.count() > 0) {
      await expect(consultationCards.first()).toBeVisible()
    }
  })

  test('should join video consultation', async ({ page }) => {
    // This test assumes there's an upcoming video consultation
    await page.goto('/consultas')
    
    // Look for "Entrar" button for video consultations
    const joinButton = page.locator('button:has-text("Entrar")')
    
    if (await joinButton.isVisible()) {
      // Mock window.open to prevent actual navigation
      await page.evaluate(() => {
        window.open = jest.fn()
      })
      
      await joinButton.click()
      
      // Verify window.open was called with Jitsi URL
      const openCalls = await page.evaluate(() => (window as any).open.mock.calls)
      expect(openCalls.length).toBeGreaterThan(0)
      expect(openCalls[0][0]).toContain('meet.jit.si')
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/consultas')
    
    // Check mobile navigation
    await expect(page.locator('button[aria-label="Open menu"]')).toBeVisible()
    
    // Open mobile menu
    await page.click('button[aria-label="Open menu"]')
    await expect(page.locator('text=📹 Agendar Consulta')).toBeVisible()
    
    // Click on consultation link
    await page.click('text=📹 Agendar Consulta')
    await page.waitForURL('/consultas')
    
    // Check if content is properly displayed on mobile
    await expect(page.locator('h1')).toContainText('Consultas Jurídicas')
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/consultations/create', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      })
    })
    
    await page.goto('/consultas')
    await page.click('text=Agendar Consulta', { first: true })
    
    // Fill form and submit
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateString = tomorrow.toISOString().split('T')[0]
    
    await page.fill('input[type="date"]', dateString)
    await page.waitForSelector('button:has-text("09:00")')
    await page.click('button:has-text("09:00"):not(:disabled)')
    await page.click('text=Confirmar Agendamento')
    
    // Should display error message
    await expect(page.locator('text=Erro ao agendar consulta')).toBeVisible()
  })

  test('should handle loading states', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/lawyers', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        })
      }, 2000) // 2 second delay
    })
    
    await page.goto('/consultas')
    
    // Should show loading state
    await expect(page.locator('.animate-spin')).toBeVisible()
    
    // Wait for content to load
    await expect(page.locator('text=Advogados Disponíveis')).toBeVisible()
  })
})

test.describe('Authentication for Consultations', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/consultas')
    
    // Should redirect to login
    await page.waitForURL('/login')
    await expect(page.locator('h1')).toContainText('Login')
  })

  test('should show different content for lawyers vs clients', async ({ page }) => {
    // Login as lawyer
    await page.goto('/login')
    await page.fill('input[name="email"]', 'lawyer@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/advogado/dashboard')
    
    // Navigate to consultations
    await page.click('text=📹 Agendar Consulta')
    await page.waitForURL('/consultas')
    
    // Should show lawyer-specific content
    await expect(page.locator('text=Gerencie suas consultas agendadas')).toBeVisible()
  })
})
