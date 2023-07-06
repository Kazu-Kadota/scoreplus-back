import fsPromises from 'fs/promises'
import mustache from 'mustache'
import path from 'path'
import puppeteer from 'puppeteer'
import { Company } from 'src/models/dynamo/company'
import { PersonRequest } from 'src/models/dynamo/request-person'
import { User } from 'src/models/dynamo/user'

export interface GeneratePersonPdfParams {
  company: Company
  user: User
  person_analysis: PersonRequest,
}

const generatePersonPdf = async (person_data: GeneratePersonPdfParams) => {
  const file_path = path.join(__dirname, '..', '..', '..', '..', 'templates', 'requestplus', 'person_release_extract.mustache')

  const template = await fsPromises.readFile(file_path, 'utf-8')

  const body_html = mustache.render(template.toString(), person_data)

  const browser = await puppeteer.launch({ headless: 'new' })

  const page = await browser.newPage()

  await page.setContent(body_html, {
    waitUntil: 'domcontentloaded',
  })

  const pdf_buffer = await page.pdf({
    // Lucão, tu pode mexer aqui também
    format: 'A4',
    printBackground: true,
    margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' },
  })

  await browser.close()

  return pdf_buffer
}

export default generatePersonPdf
