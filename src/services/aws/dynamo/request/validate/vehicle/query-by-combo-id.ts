import {
  DynamoDBClient,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

import { ComboReleaseExtractKey } from '~/models/dynamo/requestplus/combo'
import { RequestplusValidateAnalysisVehicle } from '~/models/dynamo/requestplus/validate-analysis-vehicle/table'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from '~/utils/dynamo/expression'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_VEHICLE = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_VEHICLE')

const queryRequestplusValidateAnalysisVehicleByComboId = async (
  query: ComboReleaseExtractKey,
  dynamodbClient: DynamoDBClient,
): Promise<RequestplusValidateAnalysisVehicle[] | undefined> => {
  logger.debug({
    message: 'DYNAMODB: Query',
    table: DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_VEHICLE,
    ...query,
  })

  const command = new QueryCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_VALIDATE_ANALYSIS_VEHICLE,
    IndexName: 'combo-id-index',
    KeyConditionExpression: createConditionExpression(query, true),
    ExpressionAttributeNames: createExpressionAttributeNames(query),
    ExpressionAttributeValues: createExpressionAttributeValues(query),
  })

  const { Items } = await dynamodbClient.send(command)

  if (!Items) {
    return undefined
  }

  const result = Items.map((item) => (unmarshall(item) as RequestplusValidateAnalysisVehicle))

  return result
}

export default queryRequestplusValidateAnalysisVehicleByComboId
