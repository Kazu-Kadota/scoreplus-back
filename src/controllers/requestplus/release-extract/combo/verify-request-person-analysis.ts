import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { ComboReleaseExtractKey } from 'src/models/dynamo/combo'
import queryRequestPersonByComboId from 'src/services/aws/dynamo/request/analysis/person/query-by-combo-id'

const verifyRequestPersonAnalysis = async (
  combo_key: ComboReleaseExtractKey,
  dynamodbClient: DynamoDBClient,
): Promise<string[] | void> => {
  const query_person = await queryRequestPersonByComboId(combo_key, dynamodbClient)

  if (!query_person || !query_person[0]) {
    return
  }

  const request_id: string[] = []

  query_person.forEach((person) => {
    request_id.push(person.request_id)
  })

  return request_id
}

export default verifyRequestPersonAnalysis
