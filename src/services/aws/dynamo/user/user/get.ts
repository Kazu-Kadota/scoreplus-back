import {
  DynamoDBClient,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

import { UserplusUser, UserplusUserKey } from '~/models/dynamo/userplus/user'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_USERPLUS_USER = getStringEnv('DYNAMO_TABLE_USERPLUS_USER')

const getUserplusUser = async (
  key: UserplusUserKey,
  dynamodbClient: DynamoDBClient,
): Promise<UserplusUser | undefined> => {
  logger.debug({
    message: 'DYNAMODB: GetItem',
    table: DYNAMO_TABLE_USERPLUS_USER,
    ...key,
  })

  const command = new GetItemCommand({
    TableName: DYNAMO_TABLE_USERPLUS_USER,
    Key: marshall(key),
  })

  const result = await dynamodbClient.send(command)

  if (!result.Item) {
    return undefined
  }

  return unmarshall(result.Item) as UserplusUser
}

export default getUserplusUser
