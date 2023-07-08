import pdf from 'pdfjs'

import PdfBoxAnalysisItem, { PdfBoxAnalysisItemData } from './pdf-box-analysis-item'

export interface PdfBoxAnalysisData {
  title: string;
  items: PdfBoxAnalysisItemData[]
}

const PdfBoxAnalysis = (container: pdf.Cell, { title, items }: PdfBoxAnalysisData) => {
  const box = container
    .cell({ paddingLeft: 9, paddingRight: 9, borderWidth: 1, borderColor: 0x333333 })

  items.forEach((item, index) => {
    if (index > 0) {
      box.cell({ borderBottomWidth: 0.5, borderBottomColor: 0x333333 })
    }

    PdfBoxAnalysisItem(
      box,
      { ...item, title: index === 0 ? title : '' },
    )
  })
}

export default PdfBoxAnalysis
