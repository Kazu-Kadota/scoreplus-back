import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import {
  RequestplusAnalysisPerson,
  RequestplusAnalysisPersonKey,
} from '~/models/dynamo/requestplus/analysis-person/table'
import {
  RequestplusFinishedAnalysisPerson,
  RequestplusFinishedAnalysisPersonKey,
} from '~/models/dynamo/requestplus/finished-analysis-person/table'
import getRequestplusAnalysisPerson from '~/services/aws/dynamo/request/analysis/person/get'
import getRequestplusFinishedAnalysisPerson from '~/services/aws/dynamo/request/finished/person/get'
import ForbiddenError from '~/utils/errors/403-forbidden'
import NotFoundError from '~/utils/errors/404-not-found'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'
import logger from '~/utils/logger'

export type GetRequestPersonAdapterParams = {
  dynamodbClient: DynamoDBClient
  person_id: string
  request_id: string
  user_info: UserFromJwt
}

export type GetRequestPersonAdapterResponse = RequestplusAnalysisPerson | RequestplusFinishedAnalysisPerson

const getRequestPersonAdapter = async ({
  dynamodbClient,
  person_id,
  request_id,
  user_info,
}:GetRequestPersonAdapterParams): Promise<GetRequestPersonAdapterResponse> => {
  const key: RequestplusAnalysisPersonKey | RequestplusFinishedAnalysisPersonKey = {
    request_id,
    person_id,
  }
  const request_person = await getRequestplusAnalysisPerson(key, dynamodbClient)

  if (request_person) {
    const is_admin_request = user_info.user_type === 'admin'
    if (!is_admin_request && user_info.company_name === request_person.company_name) {
      logger.warn({
        message: 'Person not requested by company to be analyzed',
        company_name: user_info,
        request_id: key.request_id,
        person_id: key.person_id,
      })

      throw new ForbiddenError('Requisição de análise não solicitada pela empresa')
    }

    return request_person
  }

  const finished_person = await getRequestplusFinishedAnalysisPerson(key, dynamodbClient)

  if (finished_person) {
    const is_admin_request = user_info.user_type === 'admin'
    if (!is_admin_request && user_info.company_name === finished_person.company_name) {
      logger.warn({
        message: 'Person not requested by company to be analyzed',
        company_name: user_info,
        request_id: key.request_id,
        person_id: key.person_id,
      })

      throw new ForbiddenError('Requisição de análise não solicitada pela empresa')
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
