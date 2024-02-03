import {
  DynamoDBClient,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

import { AnalysisplusVehiclesKey } from '~/models/dynamo/analysisplus/vehicle/table'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_ANALYSISPLUS_VEHICLES = getStringEnv('DYNAMO_TABLE_ANALYSISPLUS_VEHICLES')

const deleteAnalysisplusVehicles = async (
  key: AnalysisplusVehiclesKey,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  logger.debug({
    message: 'DYNAMODB: DeleteItem',
    table: DYNAMO_TABLE_ANALYSISPLUS_VEHICLES,
    ...key,
  })

  const command = new DeleteItemCommand({
    TableName: DYNAMO_TABLE_ANALYSISPLUS_VEHICLES,
    Key: marshall(key),
    ExpressionAttributeNames: createExpressionAttributeNames(key),
    ExpressionAttributeValues: createExpressionAttributeValues(key),
    ConditionExpression: createConditionExpression(key, true),
  })

  await dynamodbClient.send(command)
}

export default deleteAnalysisplusVehicles
