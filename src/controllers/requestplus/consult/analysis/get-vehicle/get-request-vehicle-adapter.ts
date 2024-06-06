import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { UserGroupEnum } from '~/models/dynamo/enums/user'
import { RequestplusAnalysisVehicle, RequestplusAnalysisVehicleKey } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import { RequestplusFinishedAnalysisVehicle, RequestplusFinishedAnalysisVehicleKey } from '~/models/dynamo/requestplus/finished-analysis-vehicle/table'
import getRequestplusAnalysisVehicle from '~/services/aws/dynamo/request/analysis/vehicle/get'
import getRequestplusFinishedAnalysisVehicle from '~/services/aws/dynamo/request/finished/vehicle/get'
import ForbiddenError from '~/utils/errors/403-forbidden'
import NotFoundError from '~/utils/errors/404-not-found'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'
import logger from '~/utils/logger'

export type GetRequestVehicleAdapterParams = {
  dynamodbClient: DynamoDBClient
  request_id: string
  user_info: UserFromJwt
  vehicle_id: string
}

export type GetRequestVehicleAdapterResponse = RequestplusAnalysisVehicle | RequestplusFinishedAnalysisVehicle

const getRequestVehicleAdapter = async ({
  dynamodbClient,
  request_id,
  user_info,
  vehicle_id,
}: GetRequestVehicleAdapterParams): Promise<GetRequestVehicleAdapterResponse> => {
  const key: RequestplusAnalysisVehicleKey | RequestplusFinishedAnalysisVehicleKey = {
    request_id,
    vehicle_id,
  }
  const request_vehicle = await getRequestplusAnalysisVehicle(key, dynamodbClient)

  if (request_vehicle) {
    const is_client_request = user_info.user_type === UserGroupEnum.CLIENT
    if (is_client_request) {
      if (user_info.company_name !== request_vehicle.company_name) {
        logger.warn({
          message: 'Vehicle not requested by company to be analyzed',
          request_id: key.request_id,
          vehicle_id: key.vehicle_id,
        })

        throw new ForbiddenError('Requisição de análise não solicitada pela empresa')
      }

      delete request_vehicle.vehicle_analysis_options.ethical?.reason
      delete request_vehicle.vehicle_analysis_options['plate-history']?.reason
    }

    return request_vehicle
  }

  const finished_vehicle = await getRequestplusFinishedAnalysisVehicle(key, dynamodbClient)

  if (finished_vehicle) {
    const is_client_request = user_info.user_type === UserGroupEnum.CLIENT
    if (is_client_request) {
      if (user_info.company_name !== finished_vehicle.company_name) {
        logger.warn({
          message: 'Vehicle not requested by company to be analyzed',
          request_id: key.request_id,
          vehicle_id: key.vehicle_id,
        })

        throw new ForbiddenError('Requisição de análise não solicitada pela empresa')
      }

      delete finished_vehicle.vehicle_analysis_options.ethical?.reason
      delete finished_vehicle.vehicle_analysis_options['plate-history']?.reason
    }

    return finished_vehicle
  }

  logger.warn({
    message: 'Vehicle not exist',
    request_id: key.request_id,
    vehicle_id: key.vehicle_id,
  })

  throw new NotFoundError('Veículo não existe', 404)
}

export default getRequestVehicleAdapter
