import {
  DynamoDBClient,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { v4 as uuid } from 'uuid'

import { UserplusCompany, UserplusCompanyBody, UserplusCompanyKey } from '~/models/dynamo/userplus/company'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_USERPLUS_COMPANY = getStringEnv('DYNAMO_TABLE_USERPLUS_COMPANY')

const putUserplusCompany = async (
  body: UserplusCompanyBody,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  logger.debug({
    message: 'DYNAMODB: PutItem',
    table: DYNAMO_TABLE_USERPLUS_COMPANY,
    company_name: body.name,
    cnpj: body.cnpj,
  })

  const now = new Date().toISOString()

  const key: UserplusCompanyKey = {
    company_id: uuid(),
  }

  const put: UserplusCompany = {
    ...key,
    ...body,
    created_at: now,
    updated_at: now,
  }

  const command = new PutItemCommand({
    TableName: DYNAMO_TABLE_USERPLUS_COMPANY,
    Item: marshall(put),
    ExpressionAttributeNames: createExpressionAttributeNames(key),
    ExpressionAttributeValues: createExpressionAttributeValues(key),
    ConditionExpression: createConditionExpression(key, false),
  })

  await dynamodbClient.send(command)
}

export default putUserplusCompany
