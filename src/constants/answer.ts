import { AnalysisResultEnum } from '~/models/dynamo/enums/request'

export const analysisResultStrings = {
  [AnalysisResultEnum.APPROVED]: 'adequado ao risco',
  [AnalysisResultEnum.REJECTED]: 'não adequado ao risco ',
}
