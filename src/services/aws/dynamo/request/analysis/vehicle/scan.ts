import {
  DynamoDBClient,
  ScanCommand,
  AttributeValue,
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

export interface ScanRequestplusAnalysisVehicleScan {
  company_name?: string
}

export interface ScanRequestplusAnalysisVehicleResponse {
  result: RequestplusAnalysisVehicle[],
  last_evaluated_key?: Record<string, AttributeValue>
}

const scanRequestplusAnalysisVehicle = async (
  scan: ScanRequestplusAnalysisVehicleScan,
  dynamodbClient: DynamoDBClient,
  last_evaluated_key?: Record<string, AttributeValue>,
): Promise<ScanRequestplusAnalysisVehicleResponse | undefined> => {
  logger.debug({
    message: 'DYNAMODB: Scan',
    table: DYNAMO_TABLE_REQUESTPLUS_ANALYSIS_VEHICLE,
    ...scan,
  })

  const command = new ScanCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_ANALYSIS_VEHICLE,
    ExpressionAttributeNames: createExpressionAttributeNames(scan),
    ExpressionAttributeValues: createExpressionAttributeValues(scan),
    ExclusiveStartKey: last_evaluated_key,
    FilterExpression: createConditionExpression(scan, true),
  })

  const { Items, LastEvaluatedKey } = await dynamodbClient.send(command)

  if (!Items) {
    return undefined
  }

  const result = Items.map((item) => (unmarshall(item) as RequestplusAnalysisVehicle))

  if (LastEvaluatedKey) {
    last_evaluated_key = LastEvaluatedKey
  }

  return {
    result,
    last_evaluated_key,
  }
}

export default scanRequestplusAnalysisVehicle
