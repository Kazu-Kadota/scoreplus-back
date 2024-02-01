import {
  DynamoDBClient,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

import { UserplusRecoveryPasswordKey } from '~/models/dynamo/userplus/recovery-password'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_USERPLUS_RECOVERY_PASSWORD = getStringEnv('DYNAMO_TABLE_USERPLUS_RECOVERY_PASSWORD')

const deleteUserplusRecoveryPassword = async (
  key: UserplusRecoveryPasswordKey,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  logger.debug({
    message: 'DYNAMODB: DeleteItem',
    table: DYNAMO_TABLE_USERPLUS_RECOVERY_PASSWORD,
    ...key,
  })

  const command = new DeleteItemCommand({
    TableName: DYNAMO_TABLE_USERPLUS_RECOVERY_PASSWORD,
    Key: marshall(key),
    ExpressionAttributeNames: createExpressionAttributeNames(key),
    ExpressionAttributeValues: createExpressionAttributeValues(key),
    ConditionExpression: createConditionExpression(key, true),
  })

  await dynamodbClient.send(command)
}

export default deleteUserplusRecoveryPassword
