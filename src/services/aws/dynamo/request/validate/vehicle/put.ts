import {
  DynamoDBClient,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

import {
  RequestplusValidateAnalysisVehicle,
  RequestplusValidateAnalysisVehicleBody,
  RequestplusValidateAnalysisVehicleKey,
} from '~/models/dynamo/requestplus/validate-analysis-vehicle/table'
import { Timestamp } from '~/models/dynamo/timestamp'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_VEHICLE = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_VEHICLE')

const putRequestplusValidateAnalysisVehicle = async (
  key: RequestplusValidateAnalysisVehicleKey,
  body: RequestplusValidateAnalysisVehicleBody & Timestamp,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  logger.debug({
    message: 'DYNAMODB: PutItem',
    table: DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_VEHICLE,
    ...key,
  })

  const now = new Date().toISOString()

  const put: RequestplusValidateAnalysisVehicle = {
    ...key,
    ...body,
    created_at: body.created_at,
    updated_at: now,
  }

  const command = new PutItemCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_VEHICLE,
    Item: marshall(put),
    ExpressionAttributeNames: createExpressionAttributeNames(key),
    ExpressionAttributeValues: createExpressionAttributeValues(key),
    ConditionExpression: createConditionExpression(key, false),
  })

  await dynamodbClient.send(command)
}

export default putRequestplusValidateAnalysisVehicle
