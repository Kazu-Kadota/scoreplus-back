import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { ComboReleaseExtractKey } from 'src/models/dynamo/combo'
import { VehicleRequest } from 'src/models/dynamo/request-vehicle'
import queryFinishedRequestVehicleByComboId from 'src/services/aws/dynamo/request/finished/vehicle/query-by-combo-id'
import ErrorHandler from 'src/utils/error-handler'
import logger from 'src/utils/logger'

const getFinishedVehicleAnalysisAdapter = async (
  combo_key: ComboReleaseExtractKey,
  dynamodbClient: DynamoDBClient,
): Promise<VehicleRequest[]> => {
  const finished_vehicle = await queryFinishedRequestVehicleByComboId(combo_key, dynamodbClient)

  if (!finished_vehicle || !finished_vehicle[0]) {
    logger.warn({
      message: 'Combo not exist',
      combo_id: combo_key.combo_id,
    })

    throw new ErrorHandler('Combo não existe', 404)
  }

  return finished_vehicle
}

export default getFinishedVehicleAnalysisAdapter
