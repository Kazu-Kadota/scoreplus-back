import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestplusFinishedAnalysisPerson, RequestplusFinishedAnalysisPersonKey } from '~/models/dynamo/requestplus/finished-analysis-person/table'
import getFinishedRequestPerson from '~/services/aws/dynamo/request/finished/person/get'
import NotFoundError from '~/utils/errors/404-not-found'
import logger from '~/utils/logger'

const getFinishedPersonAdapter = async (
  key: RequestplusFinishedAnalysisPersonKey,
  dynamodbClient: DynamoDBClient,
): Promise<RequestplusFinishedAnalysisPerson> => {
  const finished_person = await getFinishedRequestPerson(key, dynamodbClient)

  if (!finished_person) {
    logger.warn({
      message: 'Person not exist',
      request_id: key.request_id,
      person_id: key.person_id,
    })

    throw new NotFoundError('Pessoa não existe')
  }

  return finished_person
}

export default getFinishedPersonAdapter
