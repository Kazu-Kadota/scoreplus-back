import dayjs from 'dayjs'
import pdf from 'pdfjs'

import { analysisResultStrings } from 'src/constants/answer'
import { AnalysisResultEnum } from 'src/models/dynamo/answer'

import PdfBoxInfo, { PdfBoxInfoData, PdfBoxInfoSize } from './pdf-box-info'
import PdfBoxTitle from './pdf-box-title'
import PdfSpacer, { PdfSpacing } from './pdf-spacer'
import PdfTextBold from './pdf-text-bold'

export interface PdfBoxAnalysisItemData {
  values: PdfBoxInfoData[]
  validity: string;
  analysis_result?: string;
  title?: string;
  finished_at?: string;
}

const PdfBoxAnalysisItem = (container: pdf.Cell, {
  title,
  analysis_result,
  finished_at,
  validity,
  values,
}: PdfBoxAnalysisItemData) => {
  const row = container
    .table({ widths: [null, 165] })
    .row({ padding: 0, paddingTop: 7, paddingBottom: 9 })

  const analysisLeftCell = row.cell()

  if (title) {
    PdfBoxTitle(analysisLeftCell, { title })
  }

  values.forEach(value => PdfBoxInfo(analysisLeftCell, value))

  const analysisRightCell = row.cell({ paddingTop: 12 })

  const resultButton = analysisRightCell
    .cell({
      minHeight: 28,
      padding: 4,
      backgroundColor: analysis_result === AnalysisResultEnum.APPROVED ? 0x30B70E : 0xD90D26,
    })

  PdfTextBold(resultButton, 'Perfil: ', { color: 0xffffff, textAlign: 'center', fontSize: 11 })
    .add(analysisResultStrings[analysis_result as AnalysisResultEnum])

  PdfSpacer(analysisRightCell, PdfSpacing.sm)

  PdfBoxInfo(analysisRightCell, {
    label: 'Data da Análise',
    text: dayjs(finished_at).format('DD/MM/YYYY'),
    size: PdfBoxInfoSize.small,
    lineHeight: 1.2,
  })

  PdfBoxInfo(analysisRightCell, {
    label: 'Vigência da Análise',
    text: validity,
    size: PdfBoxInfoSize.small,
    lineHeight: 1.2,
  })
}

export default PdfBoxAnalysisItem
