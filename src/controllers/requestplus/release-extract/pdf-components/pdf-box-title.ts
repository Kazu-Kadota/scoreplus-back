import pdf from 'pdfjs'

import PdfSpacer, { PdfSpacing } from './pdf-spacer'
import PdfTextBold from './pdf-text-bold'

interface PdfBoxTitleData {
  title: string;
}

const PdfBoxTitle = (container: pdf.Cell, { title }: PdfBoxTitleData) => {
  PdfTextBold(container, title, { fontSize: 14, lineHeight: 1, color: 0x333333 })
  PdfSpacer(container, PdfSpacing.sm)
}

export default PdfBoxTitle
