import {
  DynamoDBClient,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

import {
  RequestplusAnalysisPersonKey,
  RequestplusAnalysisPerson,
  RequestplusAnalysisPersonBody,
} from '~/models/dynamo/requestplus/analysis-person/table'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_ANALYSIS_PERSON = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_ANALYSIS_PERSON')

const putRequestplusAnalysisPerson = async (
  key: RequestplusAnalysisPersonKey,
  body: RequestplusAnalysisPersonBody,
  dynamodbClient: DynamoDBClient,
): Promise<RequestplusAnalysisPerson> => {
  logger.debug({
    message: 'DYNAMODB: PutItem',
    table: DYNAMO_TABLE_REQUESTPLUS_ANALYSIS_PERSON,
    ...key,
  })

  const now = new Date().toISOString()

  const put: RequestplusAnalysisPerson = {
    ...key,
    ...body,
    created_at: now,
    updated_at: now,
  }

  const command = new PutItemCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_ANALYSIS_PERSON,
    Item: marshall(put),
    ExpressionAttributeNames: createExpressionAttributeNames(key),
    ExpressionAttributeValues: createExpressionAttributeValues(key),
    ConditionExpression: createConditionExpression(key, false),
  })

  await dynamodbClient.send(command)

  return put
}

export default putRequestplusAnalysisPerson
