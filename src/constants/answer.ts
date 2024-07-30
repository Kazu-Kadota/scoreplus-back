import { AnalysisResultEnum } from '~/models/dynamo/enums/request'

export const analysisResultStrings = {
  [AnalysisResultEnum.APPROVED]: 'adequado ao risco',
  [AnalysisResultEnum.REJECTED]: 'inadequado ao risco ',
}
