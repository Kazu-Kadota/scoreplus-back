import {
  DynamoDBClient,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { ComboReleaseExtractKey } from 'src/models/dynamo/combo'
import { VehicleRequest } from 'src/models/dynamo/request-vehicle'
import {
  createConditionExpression,
  createExpressionAttributeNames,
  createExpressionAttributeValues,
} from 'src/utils/dynamo/expression'
import getStringEnv from 'src/utils/get-string-env'
import logger from 'src/utils/logger'

const DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_VEHICLE = getStringEnv('DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_VEHICLE')

const queryFinishedRequestVehicleByComboId = async (
  query: ComboReleaseExtractKey,
  dynamodbClient: DynamoDBClient,
): Promise<VehicleRequest[] | undefined> => {
  logger.debug({
    message: 'Querying finished request vehicle by combo id',
    combo_id: query.combo_id,
  })

  const command = new QueryCommand({
    TableName: DYNAMO_TABLE_REQUESTPLUS_FINISHED_ANALYSIS_VEHICLE,
    IndexName: 'combo-id-index',
    KeyConditionExpression: createConditionExpression(query, true),
    ExpressionAttributeNames: createExpressionAttributeNames(query),
    ExpressionAttributeValues: createExpressionAttributeValues(query),
  })

  const { Items } = await dynamodbClient.send(command)

  if (!Items) {
    return undefined
  }

  const result = Items.map((item) => (unmarshall(item) as VehicleRequest))

  return result
}

export default queryFinishedRequestVehicleByComboId
