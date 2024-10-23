import {
  DynamoDBClient,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

import {
  RequestplusCompanyConsult,
  RequestplusCompanyConsultBody,
  RequestplusCompanyConsultKey,
} from '~/models/dynamo/requestplus/company-consult/table'

import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_COMPANY_CONSULT = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_COMPANY_CONSULT')

const putRequestplusCompanyConsult = async (
  key: RequestplusCompanyConsultKey,
  body: RequestplusCompanyConsultBody,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  logger.debug({
    message: 'DYNAMODB: PutItem',
    table: DYNAMO_TABLE_REQUESTPLUS_COMPANY_CONSULT,
    ...key,
  })

  const now = new Date().toISOString()

  const put: RequestplusCompanyConsult = {
    ...key,
    ...body,
    created_at: now,
    updated_at: now,
  }

  const command = new PutItemCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_COMPANY_CONSULT,
    Item: marshall(put),
    ExpressionAttributeNames: createExpressionAttributeNames(key),
    ExpressionAttributeValues: createExpressionAttributeValues(key),
    ConditionExpression: createConditionExpression(key, false),
  })

  await dynamodbClient.send(command)
}

export default putRequestplusCompanyConsult
