import { AnalysisTypeEnum } from '../../enums/request'
import { Timestamp } from '../../timestamp'
import { M2PersonRequestAnalysisResponseBody } from '~/models/m2system/request/analysis-person'

import { PersonRequestForms } from './forms'
import { PersonAnalysisOptionsRequest } from './person-analysis-options'
import { PersonAnalysisType } from './person-analysis-type'
import { PersonAnalysisStatus } from './status'

export type RequestPersonAnalysis = {
  person: PersonRequestForms
  person_analysis_options: Partial<PersonAnalysisOptionsRequest<false>>
  person_analysis_type: PersonAnalysisType
}

export type RequestplusAnalysisPersonKey = {
  person_id: string
  request_id: string
}

export type RequestplusAnalysisPersonBody = PersonRequestForms & {
  analysis_type: AnalysisTypeEnum
  combo_id?: string
  combo_number?: number
  company_name: string
  m2_request: M2PersonRequestAnalysisResponseBody[]
  person_analysis_options: Partial<PersonAnalysisOptionsRequest<false>>
  person_analysis_type: PersonAnalysisType
  status: PersonAnalysisStatus<false>
  user_id: string
}

export type RequestplusAnalysisPerson = RequestplusAnalysisPersonKey & RequestplusAnalysisPersonBody & Timestamp & {}
