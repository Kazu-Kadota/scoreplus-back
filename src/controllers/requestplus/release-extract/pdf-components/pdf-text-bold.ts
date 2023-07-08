import fs from 'fs'
import path from 'path'
import pdf from 'pdfjs'

let font: pdf.Font

const PdfTextBold = (container: pdf.Cell, text: string, options: pdf.TextOptions) => {
  if (!font) {
    const fontPath = path.join(__dirname, '..', '..', '..', '..', 'assets', 'fonts', 'Roboto-Bold.ttf')
    font = new pdf.Font(fs.readFileSync(fontPath))
  }

  return container.text(options).add(text, { font })
}

export default PdfTextBold
