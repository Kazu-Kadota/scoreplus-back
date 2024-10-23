import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'

import {
  RequestplusCompanyConsult,
  RequestplusCompanyConsultBody,
  RequestplusCompanyConsultKey,
} from '~/models/dynamo/requestplus/company-consult/table'

import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
  createUpdateExpression,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_COMPANY_CONSULT = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_COMPANY_CONSULT')

const updateRequestplusCompanyConsult = async (
  key: RequestplusCompanyConsultKey,
  body: Partial<RequestplusCompanyConsultBody>,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  const dynamoDocClient = DynamoDBDocumentClient.from(dynamodbClient)
  logger.debug({
    message: 'DYNAMODB: UpdateItem',
    table: DYNAMO_TABLE_REQUESTPLUS_COMPANY_CONSULT,
    ...key,
  })

  const now = new Date().toISOString()

  const update: Partial<RequestplusCompanyConsult> = {
    ...key,
    ...body,
    updated_at: now,
  }

  const command = new UpdateCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_COMPANY_CONSULT,
    Key: key,
    UpdateExpression: createUpdateExpression(update, Object.keys(key)),
    ExpressionAttributeNames: createExpressionAttributeNames(update),
    ExpressionAttributeValues: createExpressionAttributeValues(update, true),
    ConditionExpression: createConditionExpression(key, true),
  })

  await dynamoDocClient.send(command)
}

export default updateRequestplusCompanyConsult
