import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

const generatePdf = async (template: string) => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  })

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
