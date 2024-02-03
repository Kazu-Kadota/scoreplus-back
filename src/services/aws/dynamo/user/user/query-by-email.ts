import {
  DynamoDBClient,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

import { UserplusUser } from '~/models/dynamo/userplus/user'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_USERPLUS_USER = getStringEnv('DYNAMO_TABLE_USERPLUS_USER')

export type QueryByEmailQuery = {
  email: string
}

const queryUserplusUserByEmail = async (
  query: QueryByEmailQuery,
  dynamodbClient: DynamoDBClient,
): Promise<UserplusUser[] | undefined> => {
  logger.debug({
    message: 'DYNAMODB: Query',
    table: DYNAMO_TABLE_USERPLUS_USER,
    ...query,
  })

  const command = new QueryCommand({
    TableName: DYNAMO_TABLE_USERPLUS_USER,
    IndexName: 'email-index',
    KeyConditionExpression: createConditionExpression(query, true),
    ExpressionAttributeNames: createExpressionAttributeNames(query),
    ExpressionAttributeValues: createExpressionAttributeValues(query),
  })

  const { Items } = await dynamodbClient.send(command)

  if (!Items) {
    return undefined
  }

  const result = Items.map((item) => (unmarshall(item) as UserplusUser))

  return result
}

export default queryUserplusUserByEmail
