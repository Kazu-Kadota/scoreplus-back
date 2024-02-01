import {
  DynamoDBClient,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

import {
  RequestplusFinishedAnalysisVehicle,
  RequestplusFinishedAnalysisVehicleBody,
  RequestplusFinishedAnalysisVehicleKey,
} from '~/models/dynamo/requestplus/finished-analysis-vehicle/table'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_VEHICLE = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_VEHICLE')

const putRequestplusFinishedAnalysisVehicle = async (
  key: RequestplusFinishedAnalysisVehicleKey,
  body: RequestplusFinishedAnalysisVehicleBody,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  logger.debug({
    message: 'DYNAMODB: PutItem',
    table: DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_VEHICLE,
    ...key,
  })

  const now = new Date().toISOString()

  const put: RequestplusFinishedAnalysisVehicle = {
    ...key,
    ...body,
    created_at: now,
    finished_at: now,
    updated_at: now,
  }

  const command = new PutItemCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_VEHICLE,
    Item: marshall(put),
    ExpressionAttributeNames: createExpressionAttributeNames(key),
    ExpressionAttributeValues: createExpressionAttributeValues(key),
    ConditionExpression: createConditionExpression(key, false),
  })

  await dynamodbClient.send(command)
}

export default putRequestplusFinishedAnalysisVehicle
