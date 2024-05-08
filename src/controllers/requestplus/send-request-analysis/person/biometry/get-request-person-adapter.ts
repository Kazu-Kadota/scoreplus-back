import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { UserGroupEnum } from '~/models/dynamo/enums/user'

import {
  RequestplusAnalysisPerson,
  RequestplusAnalysisPersonKey,
} from '~/models/dynamo/requestplus/analysis-person/table'
import getRequestplusAnalysisPerson from '~/services/aws/dynamo/request/analysis/person/get'
import ForbiddenError from '~/utils/errors/403-forbidden'
import NotFoundError from '~/utils/errors/404-not-found'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'
import logger from '~/utils/logger'

export type GetRequestPersonAdapterParams = {
  company_name_from_admin?: string
  dynamodbClient: DynamoDBClient
  person_id: string
  request_id: string
  user_info: UserFromJwt
}

export type GetRequestPersonAdapterResponse = RequestplusAnalysisPerson

const getRequestPersonAdapter = async ({
  company_name_from_admin,
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

  if (!request_person) {
    logger.warn({
      message: 'Person not exist',
      request_id: key.request_id,
      person_id: key.person_id,
    })

    throw new NotFoundError('Pessoa não existe')
  }

  const is_correct_company = user_info.user_type === UserGroupEnum.CLIENT
    ? request_person.company_name === user_info.company_name
    : request_person.company_name === company_name_from_admin

  if (!is_correct_company) {
    logger.warn({
      message: 'Requested person is not the same of user company',
      person_request_company_name: request_person.company_name,
      company_name_informed: user_info.user_type === UserGroupEnum.CLIENT
        ? user_info.company_name
        : company_name_from_admin,
      request_id: key.request_id,
      person_id: key.person_id,
    })

    throw new ForbiddenError('Pessoa solicitada não é o mesmo informado pelo usuário')
  }

  return request_person
}

export default getRequestPersonAdapter
