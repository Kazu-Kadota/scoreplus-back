import {
  DynamoDBClient,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

import {
  UserplusPasswordHistory,
  UserplusPasswordHistoryBody,
  UserplusPasswordHistoryKey,
} from '~/models/dynamo/userplus/password-history'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_USERPLUS_PASSWORD_HISTORY = getStringEnv('DYNAMO_TABLE_USERPLUS_PASSWORD_HISTORY')

const putPasswordHistory = async (
  key: UserplusPasswordHistoryKey,
  body: UserplusPasswordHistoryBody,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  logger.debug({
    message: 'DYNAMODB: PutItem',
    table: DYNAMO_TABLE_USERPLUS_PASSWORD_HISTORY,
    ...key,
  })

  const now = new Date().toISOString()

  const password_history: UserplusPasswordHistory = {
    ...key,
    ...body,
    created_at: now,
  }

  const command = new PutItemCommand({
    TableName: DYNAMO_TABLE_USERPLUS_PASSWORD_HISTORY,
    Item: marshall(password_history),
    ExpressionAttributeNames: createExpressionAttributeNames(key),
    ExpressionAttributeValues: createExpressionAttributeValues(key),
    ConditionExpression: createConditionExpression(key, false),
  })

  await dynamodbClient.send(command)
}

export default putPasswordHistory
