import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { ComboReleaseExtractKey } from 'src/models/dynamo/combo'
import { PersonRequest, PersonRequestKey } from 'src/models/dynamo/request-person'
import queryFinishedRequestPersonByComboId from 'src/services/aws/dynamo/request/finished/person/query-by-combo-id'
import ErrorHandler from 'src/utils/error-handler'
import logger from 'src/utils/logger'

const getFinishedPersonAnalysisAdapter = async (
  combo_key: ComboReleaseExtractKey,
  dynamodbClient: DynamoDBClient,
): Promise<PersonRequest[]> => {
  const finished_person = await queryFinishedRequestPersonByComboId(combo_key, dynamodbClient)

  if (!finished_person || !finished_person[0]) {
    logger.warn({
      message: 'Person not exist or analysis not finished',
      combo_id: combo_key.combo_id,
    })

    throw new ErrorHandler('Pessoa não existe ou análise não finalizada', 404)
  }

  return finished_person
}

export default getFinishedPersonAnalysisAdapter
