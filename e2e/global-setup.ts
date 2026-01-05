// e2e/global-setup.ts
import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test setup...')
  
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Wait for server to be ready
    console.log('⏳ Waiting for server...')
    await page.goto('http://localhost:3000')
    await page.waitForSelector('body', { timeout: 30000 })
    console.log('✅ Server is ready')

    // Create test users if needed
    console.log('👤 Setting up test users...')
    
    // Create test client
    await page.evaluate(() => {
      localStorage.setItem('test-client', 'true')
    })

    // Create test lawyer
    await page.evaluate(() => {
      localStorage.setItem('test-lawyer', 'true')
    })

    console.log('✅ Test setup completed')
  } catch (error) {
    console.error('❌ Setup failed:', error)
    throw error
  } finally {
    await context.close()
    await browser.close()
  }
}

export default globalSetup
