import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestplusAnalysisVehicle, RequestplusAnalysisVehicleKey } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import getRequestplusAnalysisVehicle from '~/services/aws/dynamo/request/analysis/vehicle/get'
import InternalServerError from '~/utils/errors/500-internal-server-error'
import logger from '~/utils/logger'

export type GetRequestVehicleAdapterParams = {
  dynamodbClient: DynamoDBClient
  vehicle_id: string
  request_id: string
}

export type GetRequestVehicleAdapterResponse = RequestplusAnalysisVehicle

const getRequestVehicleAdapter = async ({
  dynamodbClient,
  vehicle_id,
  request_id,
}: GetRequestVehicleAdapterParams): Promise<GetRequestVehicleAdapterResponse> => {
  const key: RequestplusAnalysisVehicleKey = {
    request_id,
    vehicle_id,
  }
  const request_vehicle = await getRequestplusAnalysisVehicle(key, dynamodbClient)

  if (!request_vehicle) {
    logger.warn({
      message: 'Vehicle not exist',
      request_id: key.request_id,
      vehicle_id: key.vehicle_id,
    })

    throw new InternalServerError('Veículo não existe')
  }

  return request_vehicle
}

export default getRequestVehicleAdapter
