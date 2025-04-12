import { AnalysisResultEnum, PersonStateEnum } from '../../enums/request'
import { Timestamp } from '../../timestamp'
import { PersonAnalysisOptionsRequestValueAnswer } from '../analysis-person/person-analysis-options'
import { PersonAnalysisStatus } from '../analysis-person/status'
import { RequestplusValidateAnalysisPersonBody } from '../validate-analysis-person/table'
import { PersonAnalysisInformationValidation } from '../validate-analysis-person/validation-information'

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

export type RequestplusFinishedAnalysisPersonBody = Omit<RequestplusValidateAnalysisPersonBody, 'status' | 'information_validation'> & {
  already_consulted?: boolean
  information_validation: Partial<PersonAnalysisInformationValidation<true>>
  release_extract_id?: string
  result: AnalysisResultEnum
  status: PersonAnalysisStatus<true>
  validation_user_id: string
}

export type RequestplusFinishedAnalysisPerson = RequestplusFinishedAnalysisPersonKey & RequestplusFinishedAnalysisPersonBody & Timestamp & {
  finished_at: string
}
