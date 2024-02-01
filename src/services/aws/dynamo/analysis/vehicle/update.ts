import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'

import {
  AnalysisplusVehicles,
  AnalysisplusVehiclesBody,
  AnalysisplusVehiclesKey,
} from '~/models/dynamo/analysisplus/vehicle/table'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
  createUpdateExpression,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_ANALYSISPLUS_VEHICLES = getStringEnv('DYNAMO_TABLE_ANALYSISPLUS_VEHICLES')

const updateAnalysisplusVehicles = async (
  key: AnalysisplusVehiclesKey,
  body: Partial<AnalysisplusVehiclesBody>,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  const dynamoDocClient = DynamoDBDocumentClient.from(dynamodbClient)
  logger.debug({
    message: 'DYNAMODB: UpdateItem',
    table: DYNAMO_TABLE_ANALYSISPLUS_VEHICLES,
    ...key,
  })

  const now = new Date().toISOString()

  const update: Partial<AnalysisplusVehicles> = {
    ...key,
    ...body,
    updated_at: now,
  }

  const command = new UpdateCommand({
    TableName: DYNAMO_TABLE_ANALYSISPLUS_VEHICLES,
    Key: key,
    UpdateExpression: createUpdateExpression(update, Object.keys(key)),
    ExpressionAttributeNames: createExpressionAttributeNames(update),
    ExpressionAttributeValues: createExpressionAttributeValues(update, true),
    ConditionExpression: createConditionExpression(key, true),
  })

  await dynamoDocClient.send(command)
}

export default updateAnalysisplusVehicles
