import {
  DynamoDBClient,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

import {
  RequestplusFinishedAnalysisPerson,
  RequestplusFinishedAnalysisPersonBody,
  RequestplusFinishedAnalysisPersonKey,
} from '~/models/dynamo/requestplus/finished-analysis-person/table'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_PERSON = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_PERSON')

const putRequestplusFinishedAnalysisPerson = async (
  key: RequestplusFinishedAnalysisPersonKey,
  body: RequestplusFinishedAnalysisPersonBody,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  logger.debug({
    message: 'DYNAMODB: PutItem',
    table: DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_PERSON,
    ...key,
  })

  const now = new Date().toISOString()

  const put: RequestplusFinishedAnalysisPerson = {
    ...key,
    ...body,
    created_at: now,
    finished_at: now,
    updated_at: now,
  }

  const command = new PutItemCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_PERSON,
    Item: marshall(put),
    ExpressionAttributeNames: createExpressionAttributeNames(key),
    ExpressionAttributeValues: createExpressionAttributeValues(key),
    ConditionExpression: createConditionExpression(key, false),
  })

  await dynamodbClient.send(command)
}

export default putRequestplusFinishedAnalysisPerson
