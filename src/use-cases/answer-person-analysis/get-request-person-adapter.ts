import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestplusAnalysisPerson, RequestplusAnalysisPersonKey } from '~/models/dynamo/requestplus/analysis-person/table'
import getRequestplusAnalysisPerson from '~/services/aws/dynamo/request/analysis/person/get'
import NotFoundError from '~/utils/errors/404-not-found'
import logger from '~/utils/logger'

const getRequestPersonAdapter = async (
  request_person_key: RequestplusAnalysisPersonKey,
  dynamodbClient: DynamoDBClient,
): Promise<RequestplusAnalysisPerson> => {
  const request_person = await getRequestplusAnalysisPerson(request_person_key, dynamodbClient)

  if (!request_person) {
    logger.warn({
      message: 'Person not exist',
      person_id: request_person_key.person_id,
    })

    throw new NotFoundError('Pessoa não existe')
  }

  return request_person
}

export default getRequestPersonAdapter
