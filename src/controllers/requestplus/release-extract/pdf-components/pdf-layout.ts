import fs from 'fs'
import path from 'path'
import pdf from 'pdfjs'

import PdfBox, { PdfBoxData } from './pdf-box'
import PdfBoxAnalysis, { PdfBoxAnalysisData } from './pdf-box-analysis'
import PdfHeader, { PdfHeaderData } from './pdf-header'
import PdfSpacer from './pdf-spacer'

export interface PdfLayoutData {
  header: PdfHeaderData
  infoBox: PdfBoxData
  analysisBoxes: PdfBoxAnalysisData[]
  verification_code: string;
}

const PdfLayout = ({ header, infoBox, analysisBoxes, verification_code }: PdfLayoutData) => {
  const fontPath = path.join(__dirname, '..', '..', '..', '..', 'assets', 'fonts', 'Roboto-Regular.ttf')
  const font = new pdf.Font(fs.readFileSync(fontPath))

  const doc = new pdf.Document({ font, padding: 20 })

  const bgPath = path.join(__dirname, '..', '..', '..', '..', 'assets', 'images', 'bg-extract.jpg')
  const bg = new pdf.Image(fs.readFileSync(bgPath))
  doc.image(bg, { height: 364, x: 0, y: 364, wrap: false })

  PdfHeader(doc, header)

  PdfSpacer(doc)

  const body = doc
    .cell({ borderWidth: 1, borderColor: 0x333333, minHeight: 720, padding: 9, paddingTop: 17 })

  PdfBox(body, infoBox)

  analysisBoxes.forEach(analysis => {
    PdfSpacer(body)
    PdfBoxAnalysis(body, analysis)
  })

  doc.cell(`CÓDIGO DE VERIFICAÇÃO INTERNA: ${verification_code}`, {
    color: 0xb6b6b6,
    fontSize: 12,
    textAlign: 'center',
    paddingTop: 13,
  })

  return doc
}

export default PdfLayout
