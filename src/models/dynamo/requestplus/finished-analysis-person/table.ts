import { AnalysisResultEnum, AnalysisTypeEnum, PersonStateEnum } from '../../enums/request'
import { Timestamp } from '../../timestamp'
import { PersonRequestForms } from '../analysis-person/forms'
import { PersonAnalysisOptionsRequest, PersonAnalysisOptionsRequestValueAnswer } from '../analysis-person/person-analysis-options'
import { PersonAnalysisType } from '../analysis-person/person-analysis-type'
import { PersonAnalysisStatus } from '../analysis-person/status'
import { M2PersonRequestAnalysisResponseBody } from '~/models/m2system/request/analysis-person'

export type SendAnswerPersonPath = {
  person_id: string
}

export type SendAnswerPersonBody = PersonAnalysisOptionsRequestValueAnswer & {
  region?: PersonStateEnum
}

export type RequestplusFinishedAnalysisPersonKey = {
  person_id: string
  request_id: string
}

export type RequestplusFinishedAnalysisPersonBody = PersonRequestForms & {
  already_consulted?: boolean
  analysis_type: AnalysisTypeEnum
  combo_id?: string
  combo_number?: number
  company_name: string
  m2_request?: M2PersonRequestAnalysisResponseBody[]
  person_analysis_options: Partial<PersonAnalysisOptionsRequest<true>>
  person_analysis_type: PersonAnalysisType
  release_extract_id?: string
  result: AnalysisResultEnum
  status: PersonAnalysisStatus<true>
  user_id: string
}

export type RequestplusFinishedAnalysisPerson = RequestplusFinishedAnalysisPersonKey & RequestplusFinishedAnalysisPersonBody & Timestamp & {
  finished_at: string
}
