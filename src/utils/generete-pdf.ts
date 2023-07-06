import puppeteer from 'puppeteer'

const generatePdf = async (template: string) => {
  const browser = await puppeteer.launch({ headless: 'new' })

  const page = await browser.newPage()

  await page.setContent(template, { waitUntil: 'domcontentloaded' })

  const pdf_buffer = await page.pdf({
    format: 'A4',
    printBackground: true,
  })

  await browser.close()

  return pdf_buffer
}

export default generatePdf
