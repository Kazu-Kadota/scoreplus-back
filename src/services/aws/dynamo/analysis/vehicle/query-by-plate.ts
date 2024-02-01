import {
  DynamoDBClient,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

import { AnalysisplusVehicles } from '~/models/dynamo/analysisplus/vehicle/table'
import { PlateStateEnum } from '~/models/dynamo/enums/request'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_ANALYSISPLUS_VEHICLES = getStringEnv('DYNAMO_TABLE_ANALYSISPLUS_VEHICLES')

export type QueryPersonByDocumentQuery = {
  plate: string,
  plate_state: PlateStateEnum,
}

const queryVehicleByPlate = async (
  query: QueryPersonByDocumentQuery,
  dynamodbClient: DynamoDBClient,
): Promise<AnalysisplusVehicles[] | undefined> => {
  logger.debug({
    message: 'DYNAMODB: Query',
    table: DYNAMO_TABLE_ANALYSISPLUS_VEHICLES,
    ...query,
  })

  const command = new QueryCommand({
    TableName: DYNAMO_TABLE_ANALYSISPLUS_VEHICLES,
    IndexName: 'plate-index',
    KeyConditionExpression: createConditionExpression(query, true),
    ExpressionAttributeNames: createExpressionAttributeNames(query),
    ExpressionAttributeValues: createExpressionAttributeValues(query),
  })

  const { Items } = await dynamodbClient.send(command)

  if (!Items) {
    return undefined
  }

  const result = Items.map((item) => (unmarshall(item) as AnalysisplusVehicles))

  return result
}

export default queryVehicleByPlate
