import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { PersonRequest, PersonRequestKey } from 'src/models/dynamo/request-person'
import getFinishedRequestPerson from 'src/services/aws/dynamo/request/finished/person/get'
import ErrorHandler from 'src/utils/error-handler'
import logger from 'src/utils/logger'

const getFinishedPersonAnalysisAdapter = async (
  request_person_key: PersonRequestKey,
  dynamodbClient: DynamoDBClient,
): Promise<PersonRequest> => {
  const finished_person = await getFinishedRequestPerson(request_person_key, dynamodbClient)

  if (!finished_person) {
    logger.warn({
      message: 'Person not exist or analysis not finished',
      person_id: request_person_key.person_id,
    })

    throw new ErrorHandler('Pessoa não existe ou análise não finalizada', 404)
  }

  return finished_person
}

export default getFinishedPersonAnalysisAdapter
