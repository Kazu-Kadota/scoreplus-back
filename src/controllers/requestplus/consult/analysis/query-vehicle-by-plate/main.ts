import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { LRUCache } from 'lru-cache'

import { AnalysisResultEnum, AnalysisTypeEnum } from '~/models/dynamo/enums/request'
import { UserGroupEnum } from '~/models/dynamo/enums/user'
import { VehicleRequestForms } from '~/models/dynamo/requestplus/analysis-vehicle/forms'
import { RequestplusAnalysisVehicle, RequestplusAnalysisVehicleKey } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import { VehicleAnalysisOptionsRequest } from '~/models/dynamo/requestplus/analysis-vehicle/vehicle-analysis-options'
import { VehicleAnalysisType } from '~/models/dynamo/requestplus/analysis-vehicle/vehicle-analysis-type'
import { RequestplusFinishedAnalysisVehicle, RequestplusFinishedAnalysisVehicleKey } from '~/models/dynamo/requestplus/finished-analysis-vehicle/table'
import { Timestamp } from '~/models/dynamo/timestamp'
import { UserplusCompany } from '~/models/dynamo/userplus/company'
import { Controller } from '~/models/lambda'
import NotFoundError from '~/utils/errors/404-not-found'
import logger from '~/utils/logger'
import { Exact } from '~/utils/types/exact'

import countConsult from './count-consult'
import getCompanyAdapter from './get-company-adapter '
import queryFinishedRequestVehicleByPlateAdapter, { QueryFinishedRequestVehicleByPlateAdapterParams } from './query-finished-request-vehicle-by-plate-adapter'
import queryRequestVehicleByPlateAdapter, { QueryRequestVehicleByPlateAdapterParams } from './query-request-vehicle-by-plate-adapter'
import validateQuery from './validate-query'

import verifyValidityDate from './verify-validity-date'

export type QueryVehicleByPlateControllerClientFinishedResponse = RequestplusFinishedAnalysisVehicleKey & VehicleRequestForms & Timestamp & {
  analysis_type: AnalysisTypeEnum
  finished_at: string
  result: AnalysisResultEnum
  vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<true>>
  vehicle_analysis_type: VehicleAnalysisType
}

export type QueryVehicleByPlateControllerClientResponse = RequestplusAnalysisVehicleKey & VehicleRequestForms & Timestamp & {
  analysis_type: AnalysisTypeEnum
  vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<false>>
  vehicle_analysis_type: VehicleAnalysisType
}

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

const cache_options = {
  ttl: 60 * 60 * 24 * 30, // 1 hour: 60 seconds * 60 minutes * 24 hours * 30 days
  ttlAutopurge: true,
}

const company_cache = new LRUCache(cache_options)

function isFinishedAnalysisVehicle (vehicle: RequestplusFinishedAnalysisVehicle | RequestplusAnalysisVehicle): vehicle is RequestplusFinishedAnalysisVehicle {
  return (vehicle as RequestplusFinishedAnalysisVehicle).finished_at !== undefined
}

const queryVehicleByPlateController: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start query vehicle analysis by plate',
  })

  const user_info = req.user
  const query_vehicle = validateQuery({ ...req.queryStringParameters })

  const vehicles: Array<(
    QueryVehicleByPlateControllerClientFinishedResponse
    | QueryVehicleByPlateControllerClientResponse
    | RequestplusFinishedAnalysisVehicle
    | RequestplusAnalysisVehicle
    ) & {
      validity_date?: string
  }> = []

  const query_vehicle_params: QueryRequestVehicleByPlateAdapterParams = {
    dynamodbClient,
    query_vehicle,
    user_info,
  }

  const query_finished_vehicle_params: QueryFinishedRequestVehicleByPlateAdapterParams = {
    dynamodbClient,
    query_vehicle,
    user_info,
  }

  if (req.user.user_type === UserGroupEnum.CLIENT) {
    const request_vehicle = await queryRequestVehicleByPlateAdapter(query_vehicle_params)

    if (request_vehicle) {
      for (const request of request_vehicle) {
        if (request.company_name === user_info.company_name) {
          const {
            combo_id,
            combo_number,
            company_name,
            m2_request,
            status,
            user_id,
            ...client_vehicle_info
          } = request

          const vehicle: Exact<QueryVehicleByPlateControllerClientResponse, typeof client_vehicle_info> = client_vehicle_info

          vehicles.push(vehicle)
        }
      }
    }

    if (vehicles.length === 0) {
      const finished_vehicles = await queryFinishedRequestVehicleByPlateAdapter(query_finished_vehicle_params)
      if (finished_vehicles) {
        const finished_vehicle = finished_vehicles.find((value) => value.company_name === user_info.company_name) ?? finished_vehicles[0]

        const company = await getCompanyAdapter(finished_vehicle.company_name, dynamodbClient)

        const validity_date = verifyValidityDate(finished_vehicle, company)

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

        const vehicle: Exact<QueryVehicleByPlateControllerClientFinishedResponse, typeof client_vehicle_info> = client_vehicle_info

        vehicles.push({
          ...vehicle,
          validity_date,
        })

        await countConsult({
          dynamodbClient,
          finished_vehicle,
          user_info,
        })
      }
    }
  } else {
    const analysis: Array<(RequestplusFinishedAnalysisVehicle | RequestplusAnalysisVehicle)> = []
    const request_vehicle = await queryRequestVehicleByPlateAdapter(query_vehicle_params)
    if (request_vehicle) {
      analysis.push(...request_vehicle)
    }

    const finished_vehicle = await queryFinishedRequestVehicleByPlateAdapter(query_finished_vehicle_params)
    if (finished_vehicle) {
      analysis.push(...finished_vehicle)
    }

    for (const item of analysis) {
      if (isFinishedAnalysisVehicle(item)) {
        if (!company_cache.has(item.company_name)) {
          company_cache.set(item.company_name, await getCompanyAdapter(item.company_name, dynamodbClient))
        }

        const company = company_cache.get(item.company_name) as UserplusCompany
        const validity_date = verifyValidityDate(item, company)

        vehicles.push({
          ...item,
          validity_date,
        })
      } else {
        vehicles.push(item)
      }
    }
  }

  if (vehicles.length === 0) {
    logger.warn({
      message: 'Vehicle not found with plate',
      plate: query_vehicle.plate,
    })

    throw new NotFoundError('Veículo não encontrado pela placa')
  }

  logger.info({
    message: 'Finish on query vehicle analysis by plate',
  })

  return {
    body: {
      message: 'Finish on query vehicle analysis by plate',
      vehicles,
    },
  }
}

export default queryVehicleByPlateController
