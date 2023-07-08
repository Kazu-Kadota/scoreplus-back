import fs from 'fs'
import path from 'path'
import pdf from 'pdfjs'

export interface PdfHeaderData {
  title: string;
}

const PdfHeader = (doc: pdf.Document, { title }: PdfHeaderData) => {
  const container = doc
    .cell({ padding: 2, borderWidth: 1, borderColor: 0x333333 })

  const box = container
    .table({ widths: [93, null, 93] })
    .row({ paddingLeft: 8, paddingRight: 8, minHeight: 38 })

  const logoPath = path.join(__dirname, '..', '..', '..', '..', 'assets', 'images', 'logo.jpg')
  const logo = new pdf.Image(fs.readFileSync(logoPath))

  box
    .cell({ paddingTop: 12.5 })
    .image(logo, { width: 93 })

  box
    .cell({ paddingTop: 2 })
    .text(title, { textAlign: 'center', color: 0x333333, fontSize: 20 })

  box.cell()
}

export default PdfHeader
