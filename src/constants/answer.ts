import { AnalysisResultEnum } from 'src/models/dynamo/answer'

export const analysisResultStrings = {
  [AnalysisResultEnum.APPROVED]: 'adequado ao risco',
  [AnalysisResultEnum.REJECTED]: 'não adequado ao risco ',
}
