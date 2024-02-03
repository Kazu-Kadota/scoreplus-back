import {
  DynamoDBClient,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

import { PlateStateEnum } from '~/models/dynamo/enums/request'
import { RequestplusAnalysisVehicle } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import {
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_ANALYSIS_VEHICLE = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_ANALYSIS_VEHICLE')

export type QueryRequestplusAnalysisVehicleByPlateQuery = {
  plate: string
  plate_state: PlateStateEnum
  company_name?: string
}

const queryRequestplusAnalysisVehicleByPlate = async (
  query: QueryRequestplusAnalysisVehicleByPlateQuery,
  dynamodbClient: DynamoDBClient,
): Promise<RequestplusAnalysisVehicle[] | undefined> => {
  logger.debug({
    message: 'DYNAMODB: Query',
    table: DYNAMO_TABLE_REQUESTPLUS_ANALYSIS_VEHICLE,
    ...query,
  })

  let filterExpression

  if (query.company_name) {
    filterExpression = '#company_name = :company_name'
  }

  const command = new QueryCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_ANALYSIS_VEHICLE,
    IndexName: 'plate-index',
    KeyConditionExpression: '#plate = :plate AND #plate_state = :plate_state',
    ExpressionAttributeNames: createExpressionAttributeNames(query),
    ExpressionAttributeValues: createExpressionAttributeValues(query),
    FilterExpression: filterExpression,
  })

  const { Items } = await dynamodbClient.send(command)

  if (!Items) {
    return undefined
  }

  const result = Items.map((item) => (unmarshall(item) as RequestplusAnalysisVehicle))

  return result
}

export default queryRequestplusAnalysisVehicleByPlate
