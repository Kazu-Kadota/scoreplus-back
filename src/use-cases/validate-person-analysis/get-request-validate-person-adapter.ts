import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestplusValidateAnalysisPerson, RequestplusValidateAnalysisPersonKey } from '~/models/dynamo/requestplus/validate-analysis-person/table'
import getRequestplusValidateAnalysisPerson from '~/services/aws/dynamo/request/validate/person/get'
import NotFoundError from '~/utils/errors/404-not-found'
import logger from '~/utils/logger'

const getRequestValidatePersonAdapter = async (
  request_person_key: RequestplusValidateAnalysisPersonKey,
  dynamodbClient: DynamoDBClient,
): Promise<RequestplusValidateAnalysisPerson> => {
  const request_person = await getRequestplusValidateAnalysisPerson(request_person_key, dynamodbClient)

  if (!request_person) {
    logger.warn({
      message: 'Person not exist',
      person_id: request_person_key.person_id,
    })

    throw new NotFoundError('Pessoa não existe')
  }

  return request_person
}

export default getRequestValidatePersonAdapter
