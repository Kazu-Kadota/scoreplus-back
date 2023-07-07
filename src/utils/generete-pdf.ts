import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

import getStringEnv from './get-string-env'

const IS_LOCAL = getStringEnv('IS_LOCAL')

const generatePdf = async (template: string) => {
  const params = {
    args: IS_LOCAL ? puppeteer.defaultArgs() : chromium.args,
    defaultViewport: chromium.defaultViewport,
    // Need to install chromium-browser on your pc: sudo apt-get install chromium-browser
    executablePath: IS_LOCAL ? '/usr/bin/chromium-browser' : await chromium.executablePath(),
    headless: IS_LOCAL ? false : chromium.headless,
    ignoreHTTPSErrors: true,
  }
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
