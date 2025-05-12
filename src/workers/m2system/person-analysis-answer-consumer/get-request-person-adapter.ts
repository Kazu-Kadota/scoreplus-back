import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import {
  RequestplusAnalysisPerson,
  RequestplusAnalysisPersonKey,
} from '~/models/dynamo/requestplus/analysis-person/table'
import getRequestplusAnalysisPerson from '~/services/aws/dynamo/request/analysis/person/get'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

export type GetRequestPersonAdapterParams = {
  dynamodbClient: DynamoDBClient
  person_id: string
  request_id: string
}

export type GetRequestPersonAdapterResponse = RequestplusAnalysisPerson

const getRequestPersonAdapter = async ({
  dynamodbClient,
  person_id,
  request_id,
}: GetRequestPersonAdapterParams): Promise<GetRequestPersonAdapterResponse> => {
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

    throw new InternalServerError('Pessoa não existe')
  }

  return request_person
}

export default getRequestPersonAdapter
