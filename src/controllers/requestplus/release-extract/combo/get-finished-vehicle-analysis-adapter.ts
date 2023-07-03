import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { VehicleRequest, VehicleRequestKey } from 'src/models/dynamo/request-vehicle'
import getFinishedRequestVehicle from 'src/services/aws/dynamo/request/finished/vehicle/get'
import ErrorHandler from 'src/utils/error-handler'
import logger from 'src/utils/logger'

const getFinishedVehicleAnalysisAdapter = async (
  request_vehicle_key: VehicleRequestKey,
  dynamodbClient: DynamoDBClient,
): Promise<VehicleRequest> => {
  const finished_vehicle = await getFinishedRequestVehicle(request_vehicle_key, dynamodbClient)

  if (!finished_vehicle) {
    logger.warn({
      message: 'Vehicle not exist or analysis not finished',
      vehicle_id: request_vehicle_key.vehicle_id,
    })

    throw new ErrorHandler('Veículo não existe ou análise não finalizada', 404)
  }

  return finished_vehicle
}

export default getFinishedVehicleAnalysisAdapter
