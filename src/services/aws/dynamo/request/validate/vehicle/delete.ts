import {
  DynamoDBClient,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

import { RequestplusValidateAnalysisVehicleKey } from '~/models/dynamo/requestplus/validate-analysis-vehicle/table'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_VEHICLE = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_VEHICLE')

const deleteRequestplusValidateAnalysisVehicle = async (
  key: RequestplusValidateAnalysisVehicleKey,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  logger.debug({
    message: 'DYNAMODB: DeleteItem',
    table: DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_VEHICLE,
    ...key,
  })

  const command = new DeleteItemCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_VEHICLE,
    Key: marshall(key),
    ExpressionAttributeNames: createExpressionAttributeNames(key),
    ExpressionAttributeValues: createExpressionAttributeValues(key),
    ConditionExpression: createConditionExpression(key, true),
  })

  await dynamodbClient.send(command)
}

export default deleteRequestplusValidateAnalysisVehicle
