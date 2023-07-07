import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

import getStringEnv from './get-string-env'

const STAGE = getStringEnv('STAGE')

const generatePdf = async (template: string) => {
  const params = {
    args: STAGE === 'local' ? puppeteer.defaultArgs() : chromium.args,
    defaultViewport: chromium.defaultViewport,
    // Need to install chromium-browser on your pc: sudo apt-get install chromium-browser
    executablePath: STAGE === 'local' ? '/usr/bin/chromium-browser' : await chromium.executablePath(),
    headless: STAGE === 'local' ? false : chromium.headless,
    ignoreHTTPSErrors: true,
  }
  console.log(params)
  const browser = await puppeteer.launch(params)

  const page = await browser.newPage()

  await page.setContent(template, { waitUntil: 'domcontentloaded' })

  const pdf_buffer = await page.pdf({
    format: 'a4',
    printBackground: true,
  })

  await browser.close()

  return pdf_buffer
}

export default generatePdf
