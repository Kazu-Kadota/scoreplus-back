import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestplusAnalysisVehicleKey } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import getRequestplusAnalysisVehicle from '~/services/aws/dynamo/request/analysis/vehicle/get'
import NotFoundError from '~/utils/errors/404-not-found'
import logger from '~/utils/logger'

const getRequestVehicleAdapter = async (
  request_vehicle_key: RequestplusAnalysisVehicleKey,
  dynamodbClient: DynamoDBClient,
) => {
  const request_vehicle = await getRequestplusAnalysisVehicle(request_vehicle_key, dynamodbClient)

  if (!request_vehicle) {
    logger.warn({
      message: 'Vehicle no exist',
      vehicle_id: request_vehicle_key.vehicle_id,
    })

    throw new NotFoundError('Veículo não existe', 404)
  }

  return request_vehicle
}

export default getRequestVehicleAdapter
