import dayjs from 'dayjs'

import { CompanyPersonAnalysisConfigEnum } from '~/models/dynamo/enums/company'
import { PersonAnalysisType } from '~/models/dynamo/requestplus/analysis-person/person-analysis-type'

export type VerifyValidityDateParams = {
  person_analysis_type: PersonAnalysisType
  person_finished_at: string
  company_analysis_config: Record<CompanyPersonAnalysisConfigEnum, number>
}

const verifyValidityDate = ({
  company_analysis_config,
  person_analysis_type,
  person_finished_at,
}: VerifyValidityDateParams) => {
  const finished_at = dayjs(person_finished_at).toDate()
  finished_at.setDate(finished_at.getDate() + company_analysis_config[person_analysis_type.type])

  return dayjs(finished_at.toISOString()).format('DD/MM/YYYY')
}

export default verifyValidityDate
