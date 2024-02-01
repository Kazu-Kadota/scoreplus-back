import {
  DynamoDBClient,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

import {
  AnalysisplusVehicles,
  AnalysisplusVehiclesBody,
  AnalysisplusVehiclesKey,
} from '~/models/dynamo/analysisplus/vehicle/table'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_ANALYSISPLUS_VEHICLES = getStringEnv('DYNAMO_TABLE_ANALYSISPLUS_VEHICLES')

const putAnalysisplusVehicles = async (
  key: AnalysisplusVehiclesKey,
  data: AnalysisplusVehiclesBody,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  logger.debug({
    message: 'DYNAMODB: PutItem',
    table: DYNAMO_TABLE_ANALYSISPLUS_VEHICLES,
    ...key,
  })

  const now = new Date().toISOString()

  const put: AnalysisplusVehicles = {
    ...key,
    ...data,
    created_at: now,
    updated_at: now,
  }

  const command = new PutItemCommand({
    TableName: DYNAMO_TABLE_ANALYSISPLUS_VEHICLES,
    Item: marshall(put),
    ExpressionAttributeNames: createExpressionAttributeNames(key),
    ExpressionAttributeValues: createExpressionAttributeValues(key),
    ConditionExpression: createConditionExpression(key, false),
  })

  await dynamodbClient.send(command)
}

export default putAnalysisplusVehicles
