import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { PersonReleaseExtractKey, PersonRequest } from 'src/models/dynamo/request-person'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from 'src/utils/dynamo/expression'
import getStringEnv from 'src/utils/get-string-env'
import logger from 'src/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_PERSON = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_PERSON')

const queryRequestFinishedPersonByReleaseExtractId = async (
  query: PersonReleaseExtractKey,
  dynamodbClient: DynamoDBClient,
): Promise<PersonRequest[] | undefined> => {
  logger.debug({
    message: 'Querying requested person by release extract id',
    release_extract_id: query.release_extract_id,
  })

  const command = new QueryCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_PERSON,
    IndexName: 'release-extract-id-index',
    KeyConditionExpression: createConditionExpression(query, true),
    ExpressionAttributeNames: createExpressionAttributeNames(query),
    ExpressionAttributeValues: createExpressionAttributeValues(query),
  })

  const { Items } = await dynamodbClient.send(command)

  if (!Items) {
    return undefined
  }

  const result = Items.map((item) => (unmarshall(item) as PersonRequest))

  return result
}

export default queryRequestFinishedPersonByReleaseExtractId
