import {
  DynamoDBClient,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

import { RequestplusAnalysisVehicle } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_ANALYSIS_VEHICLE = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_ANALYSIS_VEHICLE')

export type QueryRequestplusAnalysisVehicleByIdQuery = {
  vehicle_id: string
}

const queryRequestplusAnalysisVehicleById = async (
  query: QueryRequestplusAnalysisVehicleByIdQuery,
  dynamodbClient: DynamoDBClient,
): Promise<RequestplusAnalysisVehicle[] | undefined> => {
  logger.debug({
    message: 'DYNAMODB: Query',
    table: DYNAMO_TABLE_REQUESTPLUS_ANALYSIS_VEHICLE,
    ...query,
  })

  const command = new QueryCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_ANALYSIS_VEHICLE,
    IndexName: 'vehicle-id-index',
    KeyConditionExpression: createConditionExpression(query, true),
    ExpressionAttributeNames: createExpressionAttributeNames(query),
    ExpressionAttributeValues: createExpressionAttributeValues(query),
  })

  const { Items } = await dynamodbClient.send(command)

  if (!Items) {
    return undefined
  }

  const result = Items.map((item) => (unmarshall(item) as RequestplusAnalysisVehicle))

  return result
}

export default queryRequestplusAnalysisVehicleById
