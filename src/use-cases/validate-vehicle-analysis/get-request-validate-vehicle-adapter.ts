import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestplusValidateAnalysisVehicle, RequestplusValidateAnalysisVehicleKey } from '~/models/dynamo/requestplus/validate-analysis-vehicle/table'
import getRequestplusValidateAnalysisVehicle from '~/services/aws/dynamo/request/validate/vehicle/get'

import NotFoundError from '~/utils/errors/404-not-found'
import logger from '~/utils/logger'

const getRequestValidateVehicleAdapter = async (
  request_vehicle_key: RequestplusValidateAnalysisVehicleKey,
  dynamodbClient: DynamoDBClient,
): Promise<RequestplusValidateAnalysisVehicle> => {
  const request_vehicle = await getRequestplusValidateAnalysisVehicle(request_vehicle_key, dynamodbClient)

  if (!request_vehicle) {
    logger.warn({
      message: 'Vehicle not exist',
      vehicle_id: request_vehicle_key.vehicle_id,
    })

    throw new NotFoundError('Veículo não existe')
  }

  return request_vehicle
}

export default getRequestValidateVehicleAdapter
