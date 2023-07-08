import pdf from 'pdfjs'

import PdfBoxInfo, { PdfBoxInfoData } from './pdf-box-info'
import PdfBoxTitle from './pdf-box-title'

export interface PdfBoxData {
  title: string;
  values: PdfBoxInfoData[]
}

const PdfBox = (container: pdf.Cell, { title, values }: PdfBoxData) => {
  const box = container
    .cell({ borderWidth: 1, paddingLeft: 9, paddingTop: 7, paddingBottom: 9, paddingRight: 9, borderColor: 0x333333 })

  PdfBoxTitle(box, { title })

  values.forEach(value => PdfBoxInfo(box, value))
}

export default PdfBox
