import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { PersonRequest, PersonRequestKey } from 'src/models/dynamo/request-person'
import getRequestPerson from 'src/services/aws/dynamo/request/analysis/person/get'
import ErrorHandler from 'src/utils/error-handler'
import logger from 'src/utils/logger'

const getRequestPersonAdapter = async (
  request_person_key: PersonRequestKey,
  dynamodbClient: DynamoDBClient,
): Promise<PersonRequest> => {
  const request_person = await getRequestPerson(request_person_key, dynamodbClient)

  if (!request_person) {
    logger.warn({
      message: 'Person not exist',
      person_id: request_person_key.person_id,
    })

    throw new ErrorHandler('Pessoa não existe', 404)
  }

  return request_person
}

export default getRequestPersonAdapter
