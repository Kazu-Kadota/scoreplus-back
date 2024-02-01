import {
  DynamoDBClient,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

import {
  UserplusRecoveryPassword,
  UserplusRecoveryPasswordBody,
  UserplusRecoveryPasswordKey,
} from '~/models/dynamo/userplus/recovery-password'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_USERPLUS_RECOVERY_PASSWORD = getStringEnv('DYNAMO_TABLE_USERPLUS_RECOVERY_PASSWORD')

const putUserplusRecoveryPassword = async (
  key: UserplusRecoveryPasswordKey,
  body: UserplusRecoveryPasswordBody,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  logger.debug({
    message: 'DYNAMODB: PutItem',
    table: DYNAMO_TABLE_USERPLUS_RECOVERY_PASSWORD,
    ...key,
  })

  const now = new Date().toISOString()

  const recovery_password: UserplusRecoveryPassword = {
    ...key,
    ...body,
    created_at: now,
    updated_at: now,
  }

  const command = new PutItemCommand({
    TableName: DYNAMO_TABLE_USERPLUS_RECOVERY_PASSWORD,
    Item: marshall(recovery_password),
    ExpressionAttributeNames: createExpressionAttributeNames(key),
    ExpressionAttributeValues: createExpressionAttributeValues(key),
    ConditionExpression: createConditionExpression(key, false),
  })

  await dynamodbClient.send(command)
}

export default putUserplusRecoveryPassword
