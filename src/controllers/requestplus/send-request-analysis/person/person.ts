import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { CompanySystemConfig } from 'src/models/dynamo/company'
import { AnalysisTypeEnum, PersonAnalysisTypeEnum, PersonRegionTypeEnum, StateEnum } from 'src/models/dynamo/request-enum'
import { PersonRequestKey, PersonRequestForms, PersonRequestBody, PersonAnalysisConfig } from 'src/models/dynamo/request-person'
import putRequestPerson from 'src/services/aws/dynamo/request/analysis/person/put'
import { UserInfoFromJwt } from 'src/utils/extract-jwt-lambda'
import logger from 'src/utils/logger'
import removeEmpty from 'src/utils/remove-empty'
import { v4 as uuid } from 'uuid'

import getPersonId from './get-person-id'
import personStatusConstructor from './status-constructor'

export interface PersonAnalysisResponse {
  analysis_type: AnalysisTypeEnum
  name: string
  person_id: string
  person_analysis_type: PersonAnalysisTypeEnum
  region_type: PersonRegionTypeEnum,
  region?: StateEnum,
  release_extract_id?: string
  request_id: string
}

export interface PersonAnalysisRequest {
  analysis_type: AnalysisTypeEnum
  combo_id?: string
  combo_number?: number
  company_system_config: CompanySystemConfig
  dynamodbClient: DynamoDBClient
  person_analysis_config: PersonAnalysisConfig
  person_analysis_type: PersonAnalysisTypeEnum
  person_data: PersonRequestForms
  region_type: PersonRegionTypeEnum,
  region?: StateEnum,
  release_extract_id?: string
  user_info: UserInfoFromJwt
}

const personAnalysis = async (
  {
    analysis_type,
    combo_id,
    combo_number,
    company_system_config,
    dynamodbClient,
    person_analysis_config,
    person_analysis_type,
    person_data,
    region_type,
    region,
    release_extract_id,
    user_info,
  }: PersonAnalysisRequest,
): Promise<PersonAnalysisResponse> => {
  logger.debug({
    message: 'Requested person analysis',
    analysis_type,
    company_name: user_info.company_name,
    user_id: user_info.user_id,
  })

  const request_id = uuid()

  const person_id = await getPersonId(person_data.document, dynamodbClient)

  const status = personStatusConstructor(company_system_config)

  const data_request_person: PersonRequestBody = {
    ...person_data,
    analysis_type,
    combo_id,
    combo_number: combo_number || undefined,
    company_name: user_info.user_type === 'admin' ? person_data.company_name as string : user_info.company_name,
    person_analysis_config,
    person_analysis_type,
    region_type,
    region,
    release_extract_id,
    status,
    user_id: user_info.user_id,
  }

  const request_person_person_data = removeEmpty(data_request_person)

  const request_person_key: PersonRequestKey = {
    person_id,
    request_id,
  }

  await putRequestPerson(request_person_key, request_person_person_data, dynamodbClient)

  logger.debug({
    message: 'Successfully requested person analysis',
    region,
    region_type,
    person_id,
    request_id,
  })

  return {
    analysis_type,
    name: person_data.name,
    person_id,
    person_analysis_type,
    region_type,
    region,
    release_extract_id,
    request_id,
  }
}

export default personAnalysis
