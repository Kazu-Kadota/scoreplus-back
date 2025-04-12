import {
  DynamoDBClient,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

import {
  RequestplusValidateAnalysisPerson,
  RequestplusValidateAnalysisPersonBody,
  RequestplusValidateAnalysisPersonKey,
} from '~/models/dynamo/requestplus/validate-analysis-person/table'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
  createUpdateExpression,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON')

const updateRequestplusValidateAnalysisPerson = async (
  key: RequestplusValidateAnalysisPersonKey,
  body: Partial<RequestplusValidateAnalysisPersonBody>,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  logger.debug({
    message: 'DYNAMODB: UpdateItem',
    table: DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON,
    ...key,
  })

  const now = new Date().toISOString()

  const update: Partial<RequestplusValidateAnalysisPerson> = {
    ...key,
    ...body,
    updated_at: now,
  }

  const command = new UpdateItemCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_PERSON,
    Key: marshall(key),
    UpdateExpression: createUpdateExpression(update, Object.keys(key)),
    ExpressionAttributeNames: createExpressionAttributeNames(update),
    ExpressionAttributeValues: createExpressionAttributeValues(update),
    ConditionExpression: createConditionExpression(key, true),
  })

  await dynamodbClient.send(command)
}

export default updateRequestplusValidateAnalysisPerson
