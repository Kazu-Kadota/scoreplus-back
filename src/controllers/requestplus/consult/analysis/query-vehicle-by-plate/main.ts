import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { LRUCache } from 'lru-cache'

import { UserGroupEnum } from '~/models/dynamo/enums/user'
import { RequestplusAnalysisVehicle } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import { RequestplusFinishedAnalysisVehicle } from '~/models/dynamo/requestplus/finished-analysis-vehicle/table'
import { RequestplusValidateAnalysisVehicle } from '~/models/dynamo/requestplus/validate-analysis-vehicle/table'
import { UserplusCompany } from '~/models/dynamo/userplus/company'
import { Controller } from '~/models/lambda'
import NotFoundError from '~/utils/errors/404-not-found'
import logger from '~/utils/logger'
import { Exact } from '~/utils/types/exact'

import getCompanyAdapter from './get-company-adapter '
import queryFinishedRequestVehicleByPlateAdapter, { QueryFinishedRequestVehicleByPlateAdapterParams } from './query-finished-request-vehicle-by-plate-adapter'
import queryRequestVehicleByPlateAdapter, { QueryRequestVehicleByPlateAdapterParams } from './query-request-vehicle-by-plate-adapter'
import queryValidateVehicleByPlateAdapter from './query-validate-vehicle-by-document-adapter'
import validateQuery from './validate-query'

import verifyValidityDate, { VerifyValidityDateParams } from './verify-validity-date'

export type QueryVehicleByPlateControllerClientResponse = Omit<RequestplusAnalysisVehicle,
  'vehicle_analysis_options'
  | 'third_party'
>

export type QueryVehicleByPlateControllerClientValidateResponse = Omit<RequestplusValidateAnalysisVehicle,
  'vehicle_analysis_options'
  | 'information_validation'
  | 'third_party'
  >

export type QueryVehicleByPlateControllerClientFinishedResponse = Omit<RequestplusFinishedAnalysisVehicle,
  'vehicle_analysis_options'
  | 'information_validation'
  | 'third_party'
  | 'already_consulted'
  | 'company_name'
> & {
  is_my_company: boolean
}

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

const cache_options = {
  ttl: 60 * 60 * 24 * 30, // 1 hour: 60 seconds * 60 minutes * 24 hours * 30 days
  ttlAutopurge: true,
}

const company_cache = new LRUCache(cache_options)

function isFinishedAnalysisVehicle (vehicle: RequestplusAnalysisVehicle | RequestplusValidateAnalysisVehicle | RequestplusFinishedAnalysisVehicle): vehicle is RequestplusFinishedAnalysisVehicle {
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
    | QueryVehicleByPlateControllerClientValidateResponse
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
        if (user_info.user_type === UserGroupEnum.CLIENT && request.company_name === user_info.company_name) {
          const {
            vehicle_analysis_options,
            third_party,
            ...client_vehicle_info
          } = request

          const vehicle: Exact<QueryVehicleByPlateControllerClientResponse, typeof client_vehicle_info> = client_vehicle_info

          vehicles.push(vehicle)
        }
      }
    }

    const validate_request_vehicle = await queryValidateVehicleByPlateAdapter(query_vehicle_params)

    if (validate_request_vehicle) {
      for (const request of validate_request_vehicle) {
        if (user_info.user_type === UserGroupEnum.CLIENT && request.company_name === user_info.company_name) {
          const {
            information_validation,
            vehicle_analysis_options,
            third_party,
            ...client_vehicle_info
          } = request

          const vehicle: Exact<QueryVehicleByPlateControllerClientValidateResponse, typeof client_vehicle_info> = client_vehicle_info

          vehicles.push(vehicle)
        }
      }
    }

    const finished_vehicles = await queryFinishedRequestVehicleByPlateAdapter(query_finished_vehicle_params)

    if (finished_vehicles) {
      let last_finished_vehicle: RequestplusFinishedAnalysisVehicle | undefined = finished_vehicles[0]
      const finished_vehicles_from_company = finished_vehicles.filter((value) => value.company_name === user_info.company_name)

      if (!finished_vehicles_from_company[0] && !last_finished_vehicle) {
        logger.warn({
          message: 'Vehicle not found with plate',
          plate: query_vehicle.plate,
        })

        throw new NotFoundError('Veículo não encontrada pelo placa')
      }

      if (last_finished_vehicle && finished_vehicles_from_company[0] && last_finished_vehicle.request_id === finished_vehicles_from_company[0].request_id) {
        last_finished_vehicle = undefined
      }

      if (finished_vehicles_from_company[0]) {
        const company_from_company = await getCompanyAdapter(finished_vehicles_from_company[0].company_name, dynamodbClient)

        for (const finished_vehicle of finished_vehicles_from_company) {
          const verify_validity_date_params: VerifyValidityDateParams = {
            company: company_from_company,
            finished_vehicle,
          }

          const validity_date = verifyValidityDate(verify_validity_date_params)

          const {
            already_consulted,
            company_name,
            information_validation,
            vehicle_analysis_options,
            third_party,
            ...client_vehicle_info
          } = finished_vehicle

          const client_vehicle_info_company: QueryVehicleByPlateControllerClientFinishedResponse = {
            ...client_vehicle_info,
            is_my_company: true,
          }

          const vehicle: Exact<QueryVehicleByPlateControllerClientFinishedResponse, typeof client_vehicle_info_company> = client_vehicle_info_company

          vehicles.push({
            ...vehicle,
            validity_date,
          })
        }
      }

      if (last_finished_vehicle) {
        const company_from_last_finished_vehicle = await getCompanyAdapter(last_finished_vehicle.company_name, dynamodbClient)

        const verify_validity_date_params: VerifyValidityDateParams = {
          company: company_from_last_finished_vehicle,
          finished_vehicle: last_finished_vehicle,
        }

        const validity_date = verifyValidityDate(verify_validity_date_params)

        const {
          already_consulted,
          company_name,
          information_validation,
          vehicle_analysis_options,
          third_party,
          ...client_vehicle_info
        } = last_finished_vehicle

        const client_vehicle_info_company: QueryVehicleByPlateControllerClientFinishedResponse = {
          ...client_vehicle_info,
          is_my_company: false,
        }

        const vehicle: Exact<QueryVehicleByPlateControllerClientFinishedResponse, typeof client_vehicle_info_company> = client_vehicle_info_company

        vehicles.push({
          ...vehicle,
          validity_date,
        })
      }
    }

    // if (vehicles.length === 0) {
    //   const finished_vehicles = await queryFinishedRequestVehicleByPlateAdapter(query_finished_vehicle_params)
    //   if (finished_vehicles) {
    //     const finished_vehicle = finished_vehicles.find((value) => value.company_name === user_info.company_name)

    //     if (!finished_vehicle) {
    //       logger.warn({
    //         message: 'Vehicle not found with plate',
    //         plate: query_vehicle.plate,
    //       })

    //       throw new NotFoundError('Veículo não encontrada pela placa')
    //     }

    //     const company = await getCompanyAdapter(finished_vehicle.company_name, dynamodbClient)

    //     const verify_validity_date_params: VerifyValidityDateParams = {
    //       company,
    //       finished_vehicle,
    //     }

    //     const validity_date = verifyValidityDate(verify_validity_date_params)

    //     const {
    //       already_consulted,
    //       information_validation,
    //       vehicle_analysis_options,
    //       third_party,
    //       ...client_vehicle_info
    //     } = finished_vehicle

    //     const client_vehicle_info_company: QueryVehicleByPlateControllerClientFinishedResponse = {
    //       ...client_vehicle_info,
    //       is_my_company: user_info.company_name === company.name,
    //     }

    //     const vehicle: Exact<QueryVehicleByPlateControllerClientFinishedResponse, typeof client_vehicle_info_company> = client_vehicle_info_company

    //     vehicles.push({
    //       ...vehicle,
    //       validity_date,
    //     })
    //   }
    // }
  } else {
    const analysis: Array<(RequestplusFinishedAnalysisVehicle | RequestplusValidateAnalysisVehicle | RequestplusAnalysisVehicle)> = []
    const request_vehicle = await queryRequestVehicleByPlateAdapter(query_vehicle_params)
    if (request_vehicle) {
      analysis.push(...request_vehicle)
    }

    const validate_vehicle = await queryValidateVehicleByPlateAdapter(query_vehicle_params)
    if (validate_vehicle) {
      analysis.push(...validate_vehicle)
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

        const verify_validity_date_params: VerifyValidityDateParams = {
          company,
          finished_vehicle: item,
        }

        const validity_date = verifyValidityDate(verify_validity_date_params)

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
