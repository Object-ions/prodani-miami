import { defineConfig } from '@playwright/test'
import { existsSync } from 'node:fs'

const localChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const executablePath = process.env.CHROME_PATH || (existsSync(localChrome) ? localChrome : undefined)

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    viewport: { width: 1440, height: 900 },
    launchOptions: { executablePath },
    screenshot: 'only-on-failure',
  },
  webServer: { command: 'npm run dev -- --port 5173', url: 'http://127.0.0.1:5173', reuseExistingServer: true },
})
