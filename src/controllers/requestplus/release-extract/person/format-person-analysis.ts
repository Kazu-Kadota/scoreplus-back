import dayjs from 'dayjs'
import { analysisResultStrings } from 'src/constants/answer'
import { companyPersonAnalysisConfigStrings } from 'src/constants/company'
import { AnalysisResultEnum } from 'src/models/dynamo/answer'
import { Company, CompanyPersonAnalysisConfigEnum } from 'src/models/dynamo/company'
import { PersonRequest } from 'src/models/dynamo/request-person'

export interface PdfPersonRequest extends PersonRequest {
  isApproved: boolean;
  validity: string;
  finished_at_formatted: string;
  analysis_result_string?: string;
  analysis_config_string?: string;
}

const formatPersonAnalysis = (analysis: PersonRequest, company: Company) => {
  let validity: string

  if (analysis.person_analysis_config.type === CompanyPersonAnalysisConfigEnum.AUTONOMOUS) {
    validity = 'Próximo embarque'
  } else {
    const finished_at = dayjs(analysis.finished_at).toDate()
    finished_at.setDate(finished_at.getDate() + company.analysis_config[analysis.person_analysis_config.type])

    validity = dayjs(finished_at.toISOString()).format('DD/MM/YYYY')
  }

  if (analysis.analysis_result !== AnalysisResultEnum.APPROVED) {
    validity = 'Inadequado para embarque'
  }

  const person_analysis: PdfPersonRequest = {
    ...analysis,
    isApproved: analysis.analysis_result === AnalysisResultEnum.APPROVED,
    finished_at_formatted: dayjs(analysis.finished_at).format('DD/MM/YYYY'),
    validity,
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
