import { AnalysisResultEnum, AnalysisTypeEnum, PersonStateEnum } from '../../enums/request'
import { Timestamp } from '../../timestamp'
import { PersonRequestForms } from '../analysis-person/forms'
import { PersonAnalysisOptionsRequest, PersonAnalysisOptionsRequestValueAnswer } from '../analysis-person/person-analysis-options'
import { PersonAnalysisType } from '../analysis-person/person-analysis-type'
import { PersonAnalysisStatus } from '../analysis-person/status'

export type SendAnswerPersonPath = {
  id: string
}

export type SendAnswerPersonBody = PersonAnalysisOptionsRequestValueAnswer & {
  region?: PersonStateEnum
}

export type RequestplusFinishedAnalysisPersonKey = {
  person_id: string
  request_id: string
}

export type RequestplusFinishedAnalysisPersonBody = PersonRequestForms & {
  analysis_type: AnalysisTypeEnum
  combo_id?: string
  combo_number?: number
  company_name: string
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
