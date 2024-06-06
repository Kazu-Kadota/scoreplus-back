import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestplusAnalysisVehicle } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import { RequestplusFinishedAnalysisVehicle } from '~/models/dynamo/requestplus/finished-analysis-vehicle/table'
import queryRequestplusAnalysisVehicleByPlate from '~/services/aws/dynamo/request/analysis/vehicle/query-by-plate'
import queryRequestFinishedVehicleByPlate from '~/services/aws/dynamo/request/finished/vehicle/query-by-plate'
import NotFoundError from '~/utils/errors/404-not-found'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'
import logger from '~/utils/logger'

import { RequestVehicleByPlateQuery } from './validate-query'

const queryRequestVehicleByPlateAdapter = async (
  query_vehicle: RequestVehicleByPlateQuery,
  dynamodbClient: DynamoDBClient,
  user_info: UserFromJwt,
): Promise<(RequestplusAnalysisVehicle | RequestplusFinishedAnalysisVehicle)[]> => {
  const pending_analysis = await queryRequestplusAnalysisVehicleByPlate(
    query_vehicle,
    dynamodbClient,
  )

  const finished_analysis = await queryRequestFinishedVehicleByPlate(
    query_vehicle,
    dynamodbClient,
  )

  if ((!pending_analysis || !pending_analysis[0]) && (!finished_analysis || !finished_analysis[0])) {
    logger.warn({
      message: 'Vehicle not found with plate',
      plate: query_vehicle.plate,
    })

    throw new NotFoundError('Veículo não encontrado pela placa')
  }

  (pending_analysis as RequestplusAnalysisVehicle[]).sort(
    (r1, r2) => r1.created_at < r2.created_at
      ? 1
      : r1.created_at > r2.created_at
        ? -1
        : 0,
  );

  (finished_analysis as RequestplusFinishedAnalysisVehicle[]).sort(
    (r1, r2) => r1.created_at < r2.created_at
      ? 1
      : r1.created_at > r2.created_at
        ? -1
        : 0,
  )

  const data: (RequestplusAnalysisVehicle | RequestplusFinishedAnalysisVehicle)[] = []

  for (const item of pending_analysis as (RequestplusAnalysisVehicle | RequestplusFinishedAnalysisVehicle)[]) {
    if (user_info.user_type === 'client' && item.company_name === user_info.company_name) {
      delete item.vehicle_analysis_options.ethical?.reason
      delete item.vehicle_analysis_options['plate-history']?.reason

      data.push(item)
    } else if (user_info.user_type !== 'client') {
      data.push(item)
    }
  }

  for (const item of finished_analysis as (RequestplusAnalysisVehicle | RequestplusFinishedAnalysisVehicle)[]) {
    if (user_info.user_type === 'client' && item.company_name === user_info.company_name) {
      delete item.vehicle_analysis_options.ethical?.reason
      delete item.vehicle_analysis_options['plate-history']?.reason

      data.push(item)
    } else if (user_info.user_type !== 'client') {
      data.push(item)
    }
  }

  return data
}

export default queryRequestVehicleByPlateAdapter
