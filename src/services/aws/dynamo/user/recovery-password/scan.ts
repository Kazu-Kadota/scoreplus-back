import {
  DynamoDBClient,
  ScanCommand,
  AttributeValue,
} from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

import { UserplusRecoveryPassword } from '~/models/dynamo/userplus/recovery-password'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_USERPLUS_RECOVERY_PASSWORD = getStringEnv('DYNAMO_TABLE_USERPLUS_RECOVERY_PASSWORD')

export type ScanRecoveryPasswordResponse = {
  result: UserplusRecoveryPassword[],
  last_evaluated_key?: Record<string, AttributeValue>
}

const scanUserplusRecoveryPassword = async (
  dynamodbClient: DynamoDBClient,
  last_evaluated_key?: Record<string, AttributeValue>,
): Promise<ScanRecoveryPasswordResponse | undefined> => {
  logger.debug({
    message: 'DYNAMODB: Scan',
    table: DYNAMO_TABLE_USERPLUS_RECOVERY_PASSWORD,
  })

  const command = new ScanCommand({
    TableName: DYNAMO_TABLE_USERPLUS_RECOVERY_PASSWORD,
    ExclusiveStartKey: last_evaluated_key,
  })

  const { Items, LastEvaluatedKey } = await dynamodbClient.send(command)

  if (!Items) {
    return undefined
  }

  const result = Items.map((item) => (unmarshall(item) as UserplusRecoveryPassword))

  if (LastEvaluatedKey) {
    last_evaluated_key = LastEvaluatedKey
  }

  return {
    result,
    last_evaluated_key,
  }
}

export default scanUserplusRecoveryPassword
