import {
  DynamoDBClient,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

import { UserplusRecoveryPassword, UserplusRecoveryPasswordKey } from '~/models/dynamo/userplus/recovery-password'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_USERPLUS_RECOVERY_PASSWORD = getStringEnv('DYNAMO_TABLE_USERPLUS_RECOVERY_PASSWORD')

const getUserplusRecoveryPassword = async (
  key: UserplusRecoveryPasswordKey,
  dynamodbClient: DynamoDBClient,
): Promise<UserplusRecoveryPassword | undefined> => {
  logger.debug({
    message: 'DYNAMODB: GetItem',
    table: DYNAMO_TABLE_USERPLUS_RECOVERY_PASSWORD,
    ...key,
  })

  const command = new GetItemCommand({
    TableName: DYNAMO_TABLE_USERPLUS_RECOVERY_PASSWORD,
    Key: marshall(key),
  })

  const result = await dynamodbClient.send(command)

  if (!result.Item) {
    return undefined
  }

  return unmarshall(result.Item) as UserplusRecoveryPassword
}

export default getUserplusRecoveryPassword
