import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
const issues = []
for (const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]) {
  const page = await browser.newPage({viewport:{width,height},deviceScaleFactor:1})
  page.on('pageerror', e => issues.push({name,type:'error',message:e.message}))
  page.on('console', m => {if (['error','warning'].includes(m.type())) issues.push({name,type:m.type(),message:m.text()})})
  await page.goto('http://localhost:5173')
  await page.waitForSelector('[data-renderer="webgl"]', {timeout:30000})
  await page.waitForTimeout(1200)
  await page.getByRole('button',{name:'Pause ambient motion'}).click()
  for(const [act,p] of [['opening',0],['ingredients',0.31],['assembly',0.62],['reveal',0.96]]) {
    await page.evaluate(p => window.scrollTo(0,(document.querySelector('.experience').offsetHeight-innerHeight)*p),p)
    await page.waitForTimeout(1200)
    await page.screenshot({path:`artifacts/${name}-${act}.png`})
  }
  await page.close()
}
console.log(JSON.stringify(issues,null,2))
await fs.writeFile('artifacts/console-initial.json',JSON.stringify(issues,null,2))
await browser.close()
