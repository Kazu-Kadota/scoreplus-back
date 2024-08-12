import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { v4 as uuid } from 'uuid'

import { AnalysisTypeEnum } from '~/models/dynamo/enums/request'
import { PersonRequestForms } from '~/models/dynamo/requestplus/analysis-person/forms'
import { PersonAnalysisOptionsRequest, PersonAnalysisOptionsToRequest } from '~/models/dynamo/requestplus/analysis-person/person-analysis-options'
import { PersonAnalysisType } from '~/models/dynamo/requestplus/analysis-person/person-analysis-type'
import {
  RequestplusAnalysisPersonKey,
  RequestplusAnalysisPersonBody,
  RequestplusAnalysisPerson,
} from '~/models/dynamo/requestplus/analysis-person/table'
import { CompanyRequestPersonConfig } from '~/models/dynamo/userplus/company'
import putRequestplusAnalysisPerson from '~/services/aws/dynamo/request/analysis/person/put'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'
import logger from '~/utils/logger'
import removeEmpty from '~/utils/remove-empty'

import getPersonId from './get-person-id'
import personAnalysisOptionsConstructor from './person-analysis-options-constructor'
import personStatusConstructor from './person-status-constructor'
import sendPersonAnalysisToM2System from './send-person-analysis-to-m2system'

export type PersonAnalysisResponse = {
  analysis_type: AnalysisTypeEnum
  name: string
  person: Omit<RequestplusAnalysisPerson, 'm2_request'>
  person_analysis_options: Partial<PersonAnalysisOptionsRequest<false>>
  person_analysis_type: PersonAnalysisType
  person_id: string
  person_request_id: string
}

export type PersonAnalysisRequest = {
  analysis_type: AnalysisTypeEnum
  combo_id?: string
  combo_number?: number
  company_request_person_config: CompanyRequestPersonConfig
  dynamodbClient: DynamoDBClient
  person_analysis_options_to_request: PersonAnalysisOptionsToRequest
  person_analysis_type: PersonAnalysisType
  person_data: PersonRequestForms
  user_info: UserFromJwt
}

const requestPersonAnalysis = async ({
  analysis_type,
  combo_id,
  combo_number,
  company_request_person_config,
  dynamodbClient,
  person_analysis_options_to_request,
  person_analysis_type,
  person_data,
  user_info,
}: PersonAnalysisRequest): Promise<PersonAnalysisResponse> => {
  logger.debug({
    message: 'Requested person analysis',
    analysis_type,
  })

  const request_id = uuid()

  const person_id = await getPersonId(person_data.document, dynamodbClient)

  const person_analysis_options = personAnalysisOptionsConstructor(
    person_analysis_options_to_request,
    company_request_person_config,
  )

  const status = personStatusConstructor(person_analysis_options)

  const m2_request = await sendPersonAnalysisToM2System({
    company_request_person_config,
    person: person_data,
    person_analysis_options_to_request,
  })

  const data_request_person: RequestplusAnalysisPersonBody = {
    ...person_data,
    analysis_type,
    combo_id,
    combo_number: combo_number ?? undefined,
    company_name: user_info.user_type === 'admin' ? person_data.company_name as string : user_info.company_name,
    m2_request,
    person_analysis_options,
    person_analysis_type,
    status,
    user_id: user_info.user_id,
  }

  const request_person_person_data = removeEmpty(data_request_person)

  const request_person_key: RequestplusAnalysisPersonKey = {
    person_id,
    request_id,
  }

  const person = await putRequestplusAnalysisPerson(request_person_key, request_person_person_data, dynamodbClient)

  const { m2_request: m2, ...person_sanitized } = person

  logger.debug({
    message: 'Successfully requested person analysis',
    person_id,
    person_request_id: request_id,
  })

  return {
    analysis_type,
    name: person_data.name,
    person: person_sanitized,
    person_analysis_options,
    person_analysis_type,
    person_id,
    person_request_id: request_id,
  }
}

export default requestPersonAnalysis
