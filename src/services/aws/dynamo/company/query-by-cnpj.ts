import {
  DynamoDBClient,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

import { UserplusCompany } from '~/models/dynamo/userplus/company'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_USERPLUS_COMPANY = getStringEnv('DYNAMO_TABLE_USERPLUS_COMPANY')

export type QueryUserplusCompanyByCnpj = {
  cnpj: string
}

const queryUserplusCompanyByCnpj = async (
  query: QueryUserplusCompanyByCnpj,
  dynamodbClient: DynamoDBClient,
): Promise<UserplusCompany[] | undefined> => {
  logger.debug({
    message: 'DYNAMODB: Query',
    table: DYNAMO_TABLE_USERPLUS_COMPANY,
    ...query,
  })

  const command = new QueryCommand({
    TableName: DYNAMO_TABLE_USERPLUS_COMPANY,
    IndexName: 'cnpj-index',
    KeyConditionExpression: createConditionExpression(query, true),
    ExpressionAttributeNames: createExpressionAttributeNames(query),
    ExpressionAttributeValues: createExpressionAttributeValues(query),
  })

  const { Items } = await dynamodbClient.send(command)

  if (!Items) {
    return undefined
  }

  const result = Items.map((item) => (unmarshall(item) as UserplusCompany))

  return result
}

export default queryUserplusCompanyByCnpj
