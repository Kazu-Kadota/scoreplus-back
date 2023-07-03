import fsPromises from 'fs/promises'
import mustache from 'mustache'
import path from 'path'
import puppeteer from 'puppeteer'
import { Company } from 'src/models/dynamo/company'
import { VehicleRequest } from 'src/models/dynamo/request-vehicle'
import { User } from 'src/models/dynamo/user'

export interface GenerateVehiclePdfParams {
  company: Company
  user: User
  vehicle_analysis: VehicleRequest,
}

const generateVehiclePdf = async (vehicle_data: GenerateVehiclePdfParams) => {
  const file_path = path.join(__dirname, '..', '..', '..', '..', 'templates', 'requestplus', 'vehicle_release_extract.mustache')

  const template = await fsPromises.readFile(file_path, 'utf-8')

  const body_html = mustache.render(template.toString(), vehicle_data)

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

export default generateVehiclePdf
