import {
  DynamoDBClient,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

import {
  RequestplusValidateAnalysisPerson,
  RequestplusValidateAnalysisPersonBody,
  RequestplusValidateAnalysisPersonKey,
} from '~/models/dynamo/requestplus/validate-analysis-person/table'
import { Timestamp } from '~/models/dynamo/timestamp'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON')

const putRequestplusValidateAnalysisPerson = async (
  key: RequestplusValidateAnalysisPersonKey,
  body: RequestplusValidateAnalysisPersonBody & Timestamp,
  dynamodbClient: DynamoDBClient,
): Promise<RequestplusValidateAnalysisPerson> => {
  logger.debug({
    message: 'DYNAMODB: PutItem',
    table: DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON,
    ...key,
  })

  const now = new Date().toISOString()

  const put: RequestplusValidateAnalysisPerson = {
    ...key,
    ...body,
    created_at: body.created_at,
    updated_at: now,
  }

  const command = new PutItemCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON,
    Item: marshall(put),
    ExpressionAttributeNames: createExpressionAttributeNames(key),
    ExpressionAttributeValues: createExpressionAttributeValues(key),
    ConditionExpression: createConditionExpression(key, false),
  })

  await dynamodbClient.send(command)

  return put
}

export default putRequestplusValidateAnalysisPerson
