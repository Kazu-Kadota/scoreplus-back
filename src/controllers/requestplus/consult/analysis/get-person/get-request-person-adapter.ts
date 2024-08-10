import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { AnalysisResultEnum, AnalysisTypeEnum } from '~/models/dynamo/enums/request'
import { UserGroupEnum } from '~/models/dynamo/enums/user'
import { PersonRequestForms } from '~/models/dynamo/requestplus/analysis-person/forms'
import { PersonAnalysisOptionsRequest } from '~/models/dynamo/requestplus/analysis-person/person-analysis-options'
import { PersonAnalysisType } from '~/models/dynamo/requestplus/analysis-person/person-analysis-type'
import { RequestplusAnalysisPersonKey } from '~/models/dynamo/requestplus/analysis-person/table'
import { RequestplusFinishedAnalysisPersonKey } from '~/models/dynamo/requestplus/finished-analysis-person/table'
import { Timestamp } from '~/models/dynamo/timestamp'
import getRequestplusAnalysisPerson from '~/services/aws/dynamo/request/analysis/person/get'
import getRequestplusFinishedAnalysisPerson from '~/services/aws/dynamo/request/finished/person/get'
import ForbiddenError from '~/utils/errors/403-forbidden'
import NotFoundError from '~/utils/errors/404-not-found'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'
import logger from '~/utils/logger'
import { Exact } from '~/utils/types/exact'

import countConsult from './count-consult'

export type GetRequestPersonAdapterParams = {
  dynamodbClient: DynamoDBClient
  person_id: string
  request_id: string
  user_info: UserFromJwt
}

export type GetRequestPersonAdapterResponseFinishedPerson = RequestplusFinishedAnalysisPersonKey & PersonRequestForms & Timestamp & {
  analysis_type: AnalysisTypeEnum
  finished_at: string
  person_analysis_options: Partial<PersonAnalysisOptionsRequest<true>>
  person_analysis_type: PersonAnalysisType
  release_extract_id?: string
  result: AnalysisResultEnum
}

export type GetRequestPersonAdapterResponseRequestedPerson = RequestplusAnalysisPersonKey & PersonRequestForms & Timestamp & {
  analysis_type: AnalysisTypeEnum
  person_analysis_options: Partial<PersonAnalysisOptionsRequest<false>>
  person_analysis_type: PersonAnalysisType
  release_extract_id?: string
}

export type GetRequestPersonAdapterResponse = GetRequestPersonAdapterResponseFinishedPerson | GetRequestPersonAdapterResponseRequestedPerson

const getRequestPersonAdapter = async ({
  dynamodbClient,
  person_id,
  request_id,
  user_info,
}:GetRequestPersonAdapterParams): Promise<GetRequestPersonAdapterResponse> => {
  const key: RequestplusAnalysisPersonKey = {
    request_id,
    person_id,
  }
  const request_person = await getRequestplusAnalysisPerson(key, dynamodbClient)

  if (request_person) {
    const is_client_request = user_info.user_type === UserGroupEnum.CLIENT
    if (is_client_request) {
      if (user_info.company_name !== request_person.company_name) {
        logger.warn({
          message: 'Person in analysis',
          company_name: user_info,
          request_id: key.request_id,
          person_id: key.person_id,
        })

        throw new ForbiddenError('Pessoa em análise')
      }

      delete request_person.person_analysis_options.ethical?.reason
      request_person.person_analysis_options.history?.regions.forEach((region) => {
        delete region.reason
      })

      const {
        combo_id,
        combo_number,
        company_name,
        m2_request,
        status,
        user_id,
        ...client_person_info
      } = request_person

      const person: Exact<GetRequestPersonAdapterResponseRequestedPerson, typeof client_person_info> = client_person_info

      return person
    }

    return request_person
  }

  const finished_person = await getRequestplusFinishedAnalysisPerson(key, dynamodbClient)

  if (finished_person) {
    const is_client_request = user_info.user_type === UserGroupEnum.CLIENT
    if (is_client_request) {
      delete finished_person.person_analysis_options.ethical?.reason
      finished_person.person_analysis_options.history?.regions.forEach((region) => {
        delete region.reason
      })

      await countConsult({
        dynamodbClient,
        finished_person,
        user_info,
      })

      const {
        already_consulted,
        combo_id,
        combo_number,
        company_name,
        m2_request,
        status,
        user_id,
        ...client_person_info
      } = finished_person

      const person: Exact<GetRequestPersonAdapterResponseFinishedPerson, typeof client_person_info> = client_person_info

      return person
    }

    return finished_person
  }

  logger.warn({
    message: 'Person not exist',
    request_id: key.request_id,
    person_id: key.person_id,
  })

  throw new NotFoundError('Pessoa não existe')
}

export default getRequestPersonAdapter
