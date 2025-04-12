import { PersonStateEnum } from '../../enums/request'
import { Timestamp } from '../../timestamp'
import { PersonAnalysisOptionsRequest } from '../analysis-person/person-analysis-options'
import { RequestplusAnalysisPersonBody } from '../analysis-person/table'

import { PersonAnalysisInformationValidation, PersonAnalysisInformationValidationValueAnswer } from './validation-information'

export type SendAnswerPersonValidationPath = {
  person_id: string
}

export type SendAnswerPersonValidationBody = PersonAnalysisInformationValidationValueAnswer & {
  region?: PersonStateEnum
}

export type RequestplusValidateAnalysisPersonKey = {
  person_id: string
  request_id: string
}

export type RequestplusValidateAnalysisPersonBody = Omit<RequestplusAnalysisPersonBody, 'person_analysis_options'> & {
  requested_at: string
  answered_at: string
  information_validation: Partial<PersonAnalysisInformationValidation<false>>
  person_analysis_options: Partial<PersonAnalysisOptionsRequest<true>>
}

export type RequestplusValidateAnalysisPerson = RequestplusValidateAnalysisPersonKey & RequestplusValidateAnalysisPersonBody & Timestamp & {}
