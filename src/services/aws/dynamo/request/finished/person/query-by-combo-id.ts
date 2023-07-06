import {
  DynamoDBClient,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { ComboReleaseExtractKey } from 'src/models/dynamo/combo'
import { PersonRequest } from 'src/models/dynamo/request-person'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from 'src/utils/dynamo/expression'
import getStringEnv from 'src/utils/get-string-env'
import logger from 'src/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_PERSON = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_PERSON')

const queryFinishedRequestPersonByComboId = async (
  query: ComboReleaseExtractKey,
  dynamodbClient: DynamoDBClient,
): Promise<PersonRequest[] | undefined> => {
  logger.debug({
    message: 'Querying finished request person by combo id',
    combo_id: query.combo_id,
  })

  const command = new QueryCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_PERSON,
    IndexName: 'combo-id-index',
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

export default queryFinishedRequestPersonByComboId
