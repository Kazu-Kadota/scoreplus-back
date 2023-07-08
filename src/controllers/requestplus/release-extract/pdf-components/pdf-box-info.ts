import fs from 'fs'
import path from 'path'
import pdf from 'pdfjs'

export enum PdfBoxInfoSize {
  small = 10,
  medium = 12,
}

export interface PdfBoxInfoData {
  label: string;
  text: string
  size?: PdfBoxInfoSize
  lineHeight?: number;
}

let font: pdf.Font

const PdfBoxInfo = (
  container: pdf.Cell,
  { label, text, size = PdfBoxInfoSize.medium, lineHeight = 1.1 }: PdfBoxInfoData,
) => {
  if (!font) {
    const fontPath = path.join(__dirname, '..', '..', '..', '..', 'assets', 'fonts', 'Roboto-Medium.ttf')
    font = new pdf.Font(fs.readFileSync(fontPath))
  }

  container
    .text({ fontSize: size, lineHeight, color: 0x333333 })
    .add(`${label}: `, { font })
    .add(text)
}

export default PdfBoxInfo
