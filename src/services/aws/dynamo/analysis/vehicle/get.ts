import {
  DynamoDBClient,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

import { AnalysisplusVehicles, AnalysisplusVehiclesKey } from '~/models/dynamo/analysisplus/vehicle/table'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const DYNAMO_TABLE_ANALYSISPLUS_VEHICLES = getStringEnv('DYNAMO_TABLE_ANALYSISPLUS_VEHICLES')

const getAnalysisplusVehicles = async (
  key: AnalysisplusVehiclesKey,
  dynamodbClient: DynamoDBClient,
): Promise<AnalysisplusVehicles | undefined> => {
  logger.debug({
    message: 'DYNAMODB: GetItem',
    table: DYNAMO_TABLE_ANALYSISPLUS_VEHICLES,
    ...key,
  })

  const command = new GetItemCommand({
    TableName: DYNAMO_TABLE_ANALYSISPLUS_VEHICLES,
    Key: marshall(key),
  })

  const result = await dynamodbClient.send(command)

  if (!result.Item) {
    return undefined
  }

  return unmarshall(result.Item) as AnalysisplusVehicles
}

export default getAnalysisplusVehicles
