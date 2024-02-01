import dayjs from 'dayjs'

import { companyAnalysisConfigStrings } from '~/constants/company'
import { CompanyPersonAnalysisConfigEnum } from '~/models/dynamo/enums/company'
import { AnalysisResultEnum } from '~/models/dynamo/enums/request'
import { RequestplusFinishedAnalysisPerson } from '~/models/dynamo/requestplus/finished-analysis-person/table'
import { UserplusCompany } from '~/models/dynamo/userplus/company'

export type PdfPersonRequest = RequestplusFinishedAnalysisPerson & {
  validity: string
  analysis_config_string?: string
}

const formatPersonAnalysis = (analysis: RequestplusFinishedAnalysisPerson, company: UserplusCompany) => {
  let validity: string

  if (analysis.person_analysis_type.type === CompanyPersonAnalysisConfigEnum.AUTONOMOUS) {
    validity = 'Próximo embarque'
  } else {
    const finished_at = dayjs(analysis.finished_at).toDate()
    finished_at.setDate(finished_at.getDate() + company.analysis_config[analysis.person_analysis_type.type])

    validity = dayjs(finished_at.toISOString()).format('DD/MM/YYYY')
  }

  if (analysis.result !== AnalysisResultEnum.APPROVED) {
    validity = 'Inadequado para embarque'
  }

  const person_analysis: PdfPersonRequest = { ...analysis, validity }

  if (analysis.person_analysis_type?.type) {
    person_analysis.analysis_config_string = companyAnalysisConfigStrings[analysis.person_analysis_type.type]
  }

  return person_analysis
}

export default formatPersonAnalysis
