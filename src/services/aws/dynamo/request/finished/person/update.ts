import {
  DynamoDBClient,
  UpdateItemCommand,
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
  createUpdateExpression,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_PERSON = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_PERSON')

const updateRequestplusFinishedRequestPerson = async (
  key: RequestplusFinishedAnalysisPersonKey,
  body: Partial<RequestplusFinishedAnalysisPersonBody>,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  logger.debug({
    message: 'DYNAMODB: UpdateItem',
    table: DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_PERSON,
    ...key,
  })

  const now = new Date().toISOString()

  const update: Partial<RequestplusFinishedAnalysisPerson> = {
    ...key,
    ...body,
    updated_at: now,
  }

  const command = new UpdateItemCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_PERSON,
    Key: marshall(key),
    UpdateExpression: createUpdateExpression(update, Object.keys(key)),
    ExpressionAttributeNames: createExpressionAttributeNames(update),
    ExpressionAttributeValues: createExpressionAttributeValues(update),
    ConditionExpression: createConditionExpression(key, true),
  })

  await dynamodbClient.send(command)
}

export default updateRequestplusFinishedRequestPerson
