import pdf from 'pdfjs'

export enum PdfSpacing {
  sm = 4,
  md = 8,
}

const PdfSpacer = (doc: pdf.Cell | pdf.Document, spacing = PdfSpacing.md) => {
  doc.cell({ paddingTop: spacing })
}

export default PdfSpacer
