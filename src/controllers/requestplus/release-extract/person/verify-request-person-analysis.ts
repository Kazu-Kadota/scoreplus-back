import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { PersonReleaseExtractKey } from 'src/models/dynamo/request-person'
import queryRequestPersonByReleaseExtractId from 'src/services/aws/dynamo/request/analysis/person/query-by-release-extract-id'
import ErrorHandler from 'src/utils/error-handler'

const verifyRequestPersonAnalysis = async (
  params: PersonReleaseExtractKey,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  const query_person = await queryRequestPersonByReleaseExtractId(params, dynamodbClient)

  if (!query_person || !query_person[0]) {
    return
  }

  const request_id: string[] = []

  query_person.forEach((person) => {
    request_id.push(person.request_id)
  })

  throw new ErrorHandler('Ainda há análises pendentes e não é possível gerar o extrato de liberação.', 502, {
    request_id,
  })
}

export default verifyRequestPersonAnalysis
