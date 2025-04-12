import {
  DynamoDBClient,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

import { RequestplusValidateAnalysisVehicle, RequestplusValidateAnalysisVehicleKey } from '~/models/dynamo/requestplus/validate-analysis-vehicle/table'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_VEHICLE = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_VEHICLE')

const getRequestplusValidateAnalysisVehicle = async (
  key: RequestplusValidateAnalysisVehicleKey,
  dynamodbClient: DynamoDBClient,
): Promise<RequestplusValidateAnalysisVehicle | undefined> => {
  logger.debug({
    message: 'DYNAMODB: GetItem',
    table: DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_VEHICLE,
    ...key,
  })

  const command = new GetItemCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_VEHICLE,
    Key: marshall(key),
  })

  const result = await dynamodbClient.send(command)

  if (!result.Item) {
    return undefined
  }

  return unmarshall(result.Item) as RequestplusValidateAnalysisVehicle
}

export default getRequestplusValidateAnalysisVehicle
