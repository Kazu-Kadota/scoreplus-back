import dayjs from 'dayjs'

import { analysisResultStrings } from 'src/constants/answer'

import { companyPersonAnalysisConfigStrings } from 'src/constants/company'
import { AnalysisResultEnum } from 'src/models/dynamo/answer'

import { PersonRequest } from 'src/models/dynamo/request-person'

export interface PdfPersonRequest extends PersonRequest {
  isApproved: boolean;
  created_at_formatted: string;
  finished_at_formatted: string;
  analysis_result_string?: string;
  analysis_config_string?: string;
}

const formatPersonAnalysis = (analysis: PersonRequest) => {
  const person_analysis: PdfPersonRequest = {
    ...analysis,
    isApproved: analysis.analysis_result === AnalysisResultEnum.APPROVED,
    created_at_formatted: dayjs(analysis.created_at).format('DD/MM/YYYY'),
    finished_at_formatted: dayjs(analysis.finished_at).format('DD/MM/YYYY'),
  }

  if (analysis.analysis_result) {
    person_analysis.analysis_result_string = analysisResultStrings[analysis.analysis_result as AnalysisResultEnum]
  }

  if (analysis.person_analysis_config?.type) {
    person_analysis.analysis_config_string = companyPersonAnalysisConfigStrings[analysis.person_analysis_config.type]
  }

  return person_analysis
}

export default formatPersonAnalysis
