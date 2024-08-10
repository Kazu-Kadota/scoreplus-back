import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { AnalysisResultEnum, AnalysisTypeEnum } from '~/models/dynamo/enums/request'
import { UserGroupEnum } from '~/models/dynamo/enums/user'
import { VehicleRequestForms } from '~/models/dynamo/requestplus/analysis-vehicle/forms'
import { RequestplusAnalysisVehicleKey } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import { VehicleAnalysisOptionsRequest } from '~/models/dynamo/requestplus/analysis-vehicle/vehicle-analysis-options'
import { VehicleAnalysisType } from '~/models/dynamo/requestplus/analysis-vehicle/vehicle-analysis-type'
import { RequestplusFinishedAnalysisVehicleKey } from '~/models/dynamo/requestplus/finished-analysis-vehicle/table'
import { Timestamp } from '~/models/dynamo/timestamp'
import getRequestplusAnalysisVehicle from '~/services/aws/dynamo/request/analysis/vehicle/get'
import getRequestplusFinishedAnalysisVehicle from '~/services/aws/dynamo/request/finished/vehicle/get'
import ForbiddenError from '~/utils/errors/403-forbidden'
import NotFoundError from '~/utils/errors/404-not-found'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'
import logger from '~/utils/logger'
import { Exact } from '~/utils/types/exact'

import countConsult from './count-consult'

export type GetRequestVehicleAdapterParams = {
  dynamodbClient: DynamoDBClient
  request_id: string
  user_info: UserFromJwt
  vehicle_id: string
}

export type GetRequestVehicleAdapterResponseFinishedVehicle = RequestplusFinishedAnalysisVehicleKey & VehicleRequestForms & Timestamp & {
  analysis_type: AnalysisTypeEnum
  finished_at: string
  result: AnalysisResultEnum
  vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<true>>
  vehicle_analysis_type: VehicleAnalysisType
}

export type GetRequestVehicleAdapterResponseRequestedVehicle = RequestplusAnalysisVehicleKey & VehicleRequestForms & Timestamp & {
  analysis_type: AnalysisTypeEnum
  vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<false>>
  vehicle_analysis_type: VehicleAnalysisType
}

export type GetRequestVehicleAdapterResponse = GetRequestVehicleAdapterResponseFinishedVehicle | GetRequestVehicleAdapterResponseRequestedVehicle

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
          message: 'Vehicle in analysis',
          request_id: key.request_id,
          vehicle_id: key.vehicle_id,
        })

        throw new ForbiddenError('Veículo em análise')
      }

      delete request_vehicle.vehicle_analysis_options.ethical?.reason
      request_vehicle.vehicle_analysis_options['plate-history']?.regions.forEach((region) => {
        delete region.reason
      })

      const {
        combo_id,
        combo_number,
        company_name,
        m2_request,
        status,
        user_id,
        ...client_vehicle_info
      } = request_vehicle

      const vehicle: Exact<GetRequestVehicleAdapterResponseRequestedVehicle, typeof client_vehicle_info> = client_vehicle_info

      return vehicle
    }

    return request_vehicle
  }

  const finished_vehicle = await getRequestplusFinishedAnalysisVehicle(key, dynamodbClient)

  if (finished_vehicle) {
    const is_client_request = user_info.user_type === UserGroupEnum.CLIENT
    if (is_client_request) {
      delete finished_vehicle.vehicle_analysis_options.ethical?.reason
      finished_vehicle.vehicle_analysis_options['plate-history']?.regions.forEach((region) => {
        delete region.reason
      })

      const {
        already_consulted,
        combo_id,
        combo_number,
        company_name,
        m2_request,
        status,
        user_id,
        ...client_vehicle_info
      } = finished_vehicle

      const vehicle: Exact<GetRequestVehicleAdapterResponseFinishedVehicle, typeof client_vehicle_info> = client_vehicle_info

      await countConsult({
        dynamodbClient,
        finished_vehicle,
        user_info,
      })

      return vehicle
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
