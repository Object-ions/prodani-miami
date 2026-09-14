import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || (existsSync(macChrome) ? macChrome : undefined) })
const errors = []
const results = []
for (const [name, width, height] of [['desktop',1440,900], ['mobile',390,844]]) {
  const page = await browser.newPage({ viewport: { width, height } })
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (['warning','error'].includes(message.type())) errors.push(message.text()) })
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`) })
  await page.goto('http://localhost:4173')
  await page.waitForSelector('[data-renderer="webgl"]')
  await page.getByRole('button', {name:'Pause ambient motion'}).click()
  await page.mouse.move(0,0)
  for (const [act,value] of [['opening',0],['ingredients',.30],['assembly',.61],['reveal',.96]]) {
    await page.evaluate(value => window.scrollTo(0,(document.querySelector('.experience').offsetHeight-innerHeight)*value),value)
    await page.waitForTimeout(1300)
    await page.screenshot({path:`artifacts/final-${name}-${act}.png`})
  }
  await page.locator('#our-story').scrollIntoViewIfNeeded()
  await page.screenshot({path:`artifacts/final-${name}-story.png`})
  results.push({name,width,height,renderer:await page.locator('.experience').getAttribute('data-renderer')})
  await page.close()
}
await browser.close()
await fs.writeFile('artifacts/production-check.json',JSON.stringify({results,errors},null,2))
console.log(JSON.stringify({results,errors},null,2))
if(errors.length) process.exitCode=1
