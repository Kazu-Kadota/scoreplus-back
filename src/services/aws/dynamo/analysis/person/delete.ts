import {
  DynamoDBClient,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

import { AnalysisplusPeopleKey } from '~/models/dynamo/analysisplus/people/table'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_ANALYSISPLUS_PEOPLE = getStringEnv('DYNAMO_TABLE_ANALYSISPLUS_PEOPLE')

const deleteAnalysisplusPeople = async (
  key: AnalysisplusPeopleKey,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  logger.debug({
    message: 'DYNAMODB: DeleteItem',
    table: DYNAMO_TABLE_ANALYSISPLUS_PEOPLE,
    ...key,
  })

  const command = new DeleteItemCommand({
    TableName: DYNAMO_TABLE_ANALYSISPLUS_PEOPLE,
    Key: marshall(key),
    ExpressionAttributeNames: createExpressionAttributeNames(key),
    ExpressionAttributeValues: createExpressionAttributeValues(key),
    ConditionExpression: createConditionExpression(key, true),
  })

  await dynamodbClient.send(command)
}

export default deleteAnalysisplusPeople
