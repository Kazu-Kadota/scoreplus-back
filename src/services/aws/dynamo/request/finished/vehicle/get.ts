import {
  DynamoDBClient,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

import { RequestplusFinishedAnalysisVehicle, RequestplusFinishedAnalysisVehicleKey } from '~/models/dynamo/requestplus/finished-analysis-vehicle/table'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_VEHICLE = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_VEHICLE')

const getRequestplusFinishedAnalysisVehicle = async (
  key: RequestplusFinishedAnalysisVehicleKey,
  dynamodbClient: DynamoDBClient,
): Promise<RequestplusFinishedAnalysisVehicle | undefined> => {
  logger.debug({
    message: 'DYNAMODB: GetItem',
    table: DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_VEHICLE,
    ...key,
  })

  const command = new GetItemCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_VEHICLE,
    Key: marshall(key),
  })

  const result = await dynamodbClient.send(command)

  if (!result.Item) {
    return undefined
  }

  return unmarshall(result.Item) as RequestplusFinishedAnalysisVehicle
}

export default getRequestplusFinishedAnalysisVehicle
